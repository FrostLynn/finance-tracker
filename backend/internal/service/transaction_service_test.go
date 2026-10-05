package service_test

import (
	"context"
	"errors"
	"testing"

	"github.com/akhdan/finance-tracker/backend/internal/model"
	"github.com/akhdan/finance-tracker/backend/internal/service"
	"github.com/google/uuid"
)

type mockTxRepo struct {
	transactions []model.Transaction
	lastBalance  int64
}

func (m *mockTxRepo) CreateWithAccountMutation(ctx context.Context, tx *model.Transaction, newBalance int64) error {
	m.transactions = append(m.transactions, *tx)
	m.lastBalance = newBalance
	return nil
}

func (m *mockTxRepo) GetByID(ctx context.Context, id uuid.UUID) (*model.Transaction, error) {
	for _, tx := range m.transactions {
		if tx.ID == id {
			return &tx, nil
		}
	}
	return nil, errors.New("transaksi tidak ditemukan")
}

func (m *mockTxRepo) DeleteWithAccountReversal(ctx context.Context, txID uuid.UUID, accountID uuid.UUID, restoredBalance int64) error {
	var remaining []model.Transaction
	for _, tx := range m.transactions {
		if tx.ID != txID {
			remaining = append(remaining, tx)
		}
	}
	m.transactions = remaining
	m.lastBalance = restoredBalance
	return nil
}

func (m *mockTxRepo) ListByMonth(ctx context.Context, year int, month int) ([]model.Transaction, error) {
	return m.transactions, nil
}

func TestTransactionService_CreateTransaction_Expense(t *testing.T) {
	accID := uuid.New()
	catID := uuid.New()

	accRepo := &mockAccountRepo{
		accounts: []model.Account{
			{
				ID:             accID,
				Name:           "BCA Tabungan",
				Type:           model.AccountTypeBank,
				CurrentBalance: 1000000,
			},
		},
	}
	txRepo := &mockTxRepo{}

	svc := service.NewTransactionService(txRepo, accRepo)

	input := model.CreateTransactionInput{
		AccountID:       accID,
		CategoryID:      catID,
		Amount:          250000,
		Type:            model.TransactionTypeExpense,
		Description:     "Beli Keyboard",
		TransactionDate: "2026-10-05",
	}

	tx, err := svc.CreateTransaction(context.Background(), input)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if tx.Amount != 250000 {
		t.Errorf("expected amount 250000, got %d", tx.Amount)
	}

	// Verify balance mutation: 1.000.000 - 250.000 = 750.000
	if txRepo.lastBalance != 750000 {
		t.Errorf("expected new account balance 750000, got %d", txRepo.lastBalance)
	}
}

func TestTransactionService_CreateTransaction_Income(t *testing.T) {
	accID := uuid.New()
	catID := uuid.New()

	accRepo := &mockAccountRepo{
		accounts: []model.Account{
			{
				ID:             accID,
				Name:           "BCA Tabungan",
				Type:           model.AccountTypeBank,
				CurrentBalance: 500000,
			},
		},
	}
	txRepo := &mockTxRepo{}

	svc := service.NewTransactionService(txRepo, accRepo)

	input := model.CreateTransactionInput{
		AccountID:       accID,
		CategoryID:      catID,
		Amount:          2000000,
		Type:            model.TransactionTypeIncome,
		Description:     "Side Project Payout",
		TransactionDate: "2026-10-05",
	}

	_, err := svc.CreateTransaction(context.Background(), input)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Verify balance mutation: 500.000 + 2.000.000 = 2.500.000
	if txRepo.lastBalance != 2500000 {
		t.Errorf("expected new account balance 2500000, got %d", txRepo.lastBalance)
	}
}

func TestTransactionService_DeleteTransaction_Reversal(t *testing.T) {
	accID := uuid.New()
	catID := uuid.New()
	txID := uuid.New()

	accRepo := &mockAccountRepo{
		accounts: []model.Account{
			{
				ID:             accID,
				Name:           "BCA Tabungan",
				Type:           model.AccountTypeBank,
				CurrentBalance: 750000, // already reduced after a 250k expense
			},
		},
	}
	txRepo := &mockTxRepo{
		transactions: []model.Transaction{
			{
				ID:          txID,
				AccountID:   accID,
				CategoryID:  catID,
				Amount:      250000,
				Type:        model.TransactionTypeExpense,
				Description: "Beli Keyboard",
			},
		},
	}

	svc := service.NewTransactionService(txRepo, accRepo)

	err := svc.DeleteTransaction(context.Background(), txID)
	if err != nil {
		t.Fatalf("unexpected error deleting tx: %v", err)
	}

	// Reversal of an expense should add back the amount: 750.000 + 250.000 = 1.000.000
	if txRepo.lastBalance != 1000000 {
		t.Errorf("expected restored balance 1000000, got %d", txRepo.lastBalance)
	}
}
