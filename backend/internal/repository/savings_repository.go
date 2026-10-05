package repository

import (
	"context"

	"github.com/akhdan/finance-tracker/backend/internal/model"
	"github.com/google/uuid"
)

type SavingsRepository interface {
	Create(ctx context.Context, goal *model.SavingsGoal) error
	List(ctx context.Context) ([]model.SavingsGoal, error)
	GetByID(ctx context.Context, id uuid.UUID) (*model.SavingsGoal, error)
	AddDeposit(ctx context.Context, id uuid.UUID, amount int64) error
	Delete(ctx context.Context, id uuid.UUID) error
}
