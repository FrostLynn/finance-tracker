package repository

import (
	"context"

	"github.com/akhdan/finance-tracker/backend/internal/model"
)

type CategoryRepository interface {
	List(ctx context.Context) ([]model.Category, error)
}
