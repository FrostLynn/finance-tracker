package repository

import (
	"context"

	"github.com/akhdan/finance-tracker/backend/internal/model"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresSavingsRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresSavingsRepository(pool *pgxpool.Pool) *PostgresSavingsRepository {
	return &PostgresSavingsRepository{pool: pool}
}

func (r *PostgresSavingsRepository) Create(ctx context.Context, goal *model.SavingsGoal) error {
	query := `
		INSERT INTO savings_goals (id, name, target_amount, current_amount, target_date, icon, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.pool.Exec(ctx, query,
		goal.ID, goal.Name, goal.TargetAmount, goal.CurrentAmount, goal.TargetDate, goal.Icon, goal.CreatedAt,
	)
	return err
}

func (r *PostgresSavingsRepository) List(ctx context.Context) ([]model.SavingsGoal, error) {
	query := `
		SELECT id, name, target_amount, current_amount, target_date, icon, created_at
		FROM savings_goals
		ORDER BY created_at ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var goals []model.SavingsGoal
	for rows.Next() {
		var g model.SavingsGoal
		err := rows.Scan(
			&g.ID, &g.Name, &g.TargetAmount, &g.CurrentAmount, &g.TargetDate, &g.Icon, &g.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		goals = append(goals, g)
	}

	return goals, nil
}

func (r *PostgresSavingsRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.SavingsGoal, error) {
	query := `
		SELECT id, name, target_amount, current_amount, target_date, icon, created_at
		FROM savings_goals
		WHERE id = $1
	`
	row := r.pool.QueryRow(ctx, query, id)

	var g model.SavingsGoal
	err := row.Scan(
		&g.ID, &g.Name, &g.TargetAmount, &g.CurrentAmount, &g.TargetDate, &g.Icon, &g.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &g, nil
}

func (r *PostgresSavingsRepository) AddDeposit(ctx context.Context, id uuid.UUID, amount int64) error {
	query := `UPDATE savings_goals SET current_amount = current_amount + $1 WHERE id = $2`
	_, err := r.pool.Exec(ctx, query, amount, id)
	return err
}

func (r *PostgresSavingsRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM savings_goals WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}
