package repository

import (
	"context"

	"github.com/akhdan/finance-tracker/backend/internal/model"
	"github.com/google/uuid"
)

type AccountRepository interface {
	Create(ctx context.Context, account *model.Account) error
	GetByID(ctx context.Context, id uuid.UUID) (*model.Account, error)
	List(ctx context.Context) ([]model.Account, error)
	UpdateBalance(ctx context.Context, id uuid.UUID, newBalance int64) error
	Delete(ctx context.Context, id uuid.UUID) error
}
