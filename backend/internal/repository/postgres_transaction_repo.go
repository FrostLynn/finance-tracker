package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/akhdan/finance-tracker/backend/internal/model"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresTransactionRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresTransactionRepository(pool *pgxpool.Pool) *PostgresTransactionRepository {
	return &PostgresTransactionRepository{pool: pool}
}

func (r *PostgresTransactionRepository) CreateWithAccountMutation(ctx context.Context, tx *model.Transaction, newAccountBalance int64) error {
	dbTx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer dbTx.Rollback(ctx) // rollback jika commit belum dipanggil

	insertTxQuery := `
		INSERT INTO transactions (id, account_id, category_id, amount, type, description, transaction_date, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err = dbTx.Exec(ctx, insertTxQuery,
		tx.ID, tx.AccountID, tx.CategoryID, tx.Amount, tx.Type, tx.Description, tx.TransactionDate, tx.CreatedAt,
	)
	if err != nil {
		return err
	}

	updateAccQuery := `
		UPDATE accounts
		SET current_balance = $1, updated_at = NOW()
		WHERE id = $2
	`
	_, err = dbTx.Exec(ctx, updateAccQuery, newAccountBalance, tx.AccountID)
	if err != nil {
		return err
	}

	return dbTx.Commit(ctx)
}

func (r *PostgresTransactionRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.Transaction, error) {
	query := `
		SELECT t.id, t.account_id, a.name AS account_name, t.category_id, c.name AS category_name, c.icon AS category_icon,
		       t.amount, t.type, t.description, t.transaction_date, t.created_at
		FROM transactions t
		JOIN accounts a ON t.account_id = a.id
		JOIN categories c ON t.category_id = c.id
		WHERE t.id = $1
	`
	row := r.pool.QueryRow(ctx, query, id)

	var tx model.Transaction
	err := row.Scan(
		&tx.ID, &tx.AccountID, &tx.AccountName, &tx.CategoryID, &tx.CategoryName, &tx.CategoryIcon,
		&tx.Amount, &tx.Type, &tx.Description, &tx.TransactionDate, &tx.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &tx, nil
}

func (r *PostgresTransactionRepository) DeleteWithAccountReversal(ctx context.Context, txID uuid.UUID, accountID uuid.UUID, restoredBalance int64) error {
	dbTx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer dbTx.Rollback(ctx)

	deleteQuery := `DELETE FROM transactions WHERE id = $1`
	_, err = dbTx.Exec(ctx, deleteQuery, txID)
	if err != nil {
		return err
	}

	updateAccQuery := `
		UPDATE accounts
		SET current_balance = $1, updated_at = NOW()
		WHERE id = $2
	`
	_, err = dbTx.Exec(ctx, updateAccQuery, restoredBalance, accountID)
	if err != nil {
		return err
	}

	return dbTx.Commit(ctx)
}

func (r *PostgresTransactionRepository) ListByMonth(ctx context.Context, year int, month int) ([]model.Transaction, error) {
	startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	endDate := startDate.AddDate(0, 1, 0) // awal bulan berikutnya

	query := `
		SELECT t.id, t.account_id, a.name AS account_name, t.category_id, c.name AS category_name, c.icon AS category_icon,
		       t.amount, t.type, t.description, t.transaction_date, t.created_at
		FROM transactions t
		JOIN accounts a ON t.account_id = a.id
		JOIN categories c ON t.category_id = c.id
		WHERE t.transaction_date >= $1 AND t.transaction_date < $2
		ORDER BY t.transaction_date DESC, t.created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("error querying transactions: %w", err)
	}
	defer rows.Close()

	var transactions []model.Transaction
	for rows.Next() {
		var tx model.Transaction
		err := rows.Scan(
			&tx.ID, &tx.AccountID, &tx.AccountName, &tx.CategoryID, &tx.CategoryName, &tx.CategoryIcon,
			&tx.Amount, &tx.Type, &tx.Description, &tx.TransactionDate, &tx.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, tx)
	}

	return transactions, nil
}
