package repository

import (
	"context"

	"github.com/akhdan/finance-tracker/backend/internal/model"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresAccountRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresAccountRepository(pool *pgxpool.Pool) *PostgresAccountRepository {
	return &PostgresAccountRepository{pool: pool}
}

func (r *PostgresAccountRepository) Create(ctx context.Context, acc *model.Account) error {
	query := `
		INSERT INTO accounts (id, name, type, current_balance, credit_limit, due_day_of_month, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.pool.Exec(ctx, query,
		acc.ID, acc.Name, acc.Type, acc.CurrentBalance, acc.CreditLimit, acc.DueDayOfMonth, acc.CreatedAt, acc.UpdatedAt,
	)
	return err
}

func (r *PostgresAccountRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.Account, error) {
	query := `
		SELECT id, name, type, current_balance, credit_limit, due_day_of_month, created_at, updated_at
		FROM accounts
		WHERE id = $1
	`
	row := r.pool.QueryRow(ctx, query, id)

	var acc model.Account
	err := row.Scan(
		&acc.ID, &acc.Name, &acc.Type, &acc.CurrentBalance, &acc.CreditLimit, &acc.DueDayOfMonth, &acc.CreatedAt, &acc.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &acc, nil
}

func (r *PostgresAccountRepository) List(ctx context.Context) ([]model.Account, error) {
	query := `
		SELECT id, name, type, current_balance, credit_limit, due_day_of_month, created_at, updated_at
		FROM accounts
		ORDER BY created_at ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var accounts []model.Account
	for rows.Next() {
		var acc model.Account
		err := rows.Scan(
			&acc.ID, &acc.Name, &acc.Type, &acc.CurrentBalance, &acc.CreditLimit, &acc.DueDayOfMonth, &acc.CreatedAt, &acc.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		accounts = append(accounts, acc)
	}

	return accounts, nil
}

func (r *PostgresAccountRepository) UpdateBalance(ctx context.Context, id uuid.UUID, newBalance int64) error {
	query := `UPDATE accounts SET current_balance = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.pool.Exec(ctx, query, newBalance, id)
	return err
}

func (r *PostgresAccountRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM accounts WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}
