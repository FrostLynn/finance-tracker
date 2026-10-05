package repository

import (
	"context"

	"github.com/akhdan/finance-tracker/backend/internal/model"
	"github.com/google/uuid"
)

type TransactionRepository interface {
	CreateWithAccountMutation(ctx context.Context, tx *model.Transaction, newAccountBalance int64) error
	GetByID(ctx context.Context, id uuid.UUID) (*model.Transaction, error)
	DeleteWithAccountReversal(ctx context.Context, txID uuid.UUID, accountID uuid.UUID, restoredBalance int64) error
	ListByMonth(ctx context.Context, year int, month int) ([]model.Transaction, error)
}
