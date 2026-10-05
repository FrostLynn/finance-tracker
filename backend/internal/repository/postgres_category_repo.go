package repository

import (
	"context"

	"github.com/akhdan/finance-tracker/backend/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresCategoryRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresCategoryRepository(pool *pgxpool.Pool) *PostgresCategoryRepository {
	return &PostgresCategoryRepository{pool: pool}
}

func (r *PostgresCategoryRepository) List(ctx context.Context) ([]model.Category, error) {
	query := `SELECT id, name, type, icon, created_at FROM categories ORDER BY name ASC`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []model.Category
	for rows.Next() {
		var cat model.Category
		err := rows.Scan(&cat.ID, &cat.Name, &cat.Type, &cat.Icon, &cat.CreatedAt)
		if err != nil {
			return nil, err
		}
		categories = append(categories, cat)
	}

	return categories, nil
}
