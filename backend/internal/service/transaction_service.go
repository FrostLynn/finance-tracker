package service

import (
	"context"
	"errors"
	"time"

	"github.com/akhdan/finance-tracker/backend/internal/model"
	"github.com/akhdan/finance-tracker/backend/internal/repository"
	"github.com/google/uuid"
)

type TransactionService struct {
	txRepo      repository.TransactionRepository
	accountRepo repository.AccountRepository
}

func NewTransactionService(txRepo repository.TransactionRepository, accountRepo repository.AccountRepository) *TransactionService {
	return &TransactionService{
		txRepo:      txRepo,
		accountRepo: accountRepo,
	}
}

func (s *TransactionService) CreateTransaction(ctx context.Context, input model.CreateTransactionInput) (*model.Transaction, error) {
	txDate, err := input.Validate()
	if err != nil {
		return nil, err
	}

	acc, err := s.accountRepo.GetByID(ctx, input.AccountID)
	if err != nil || acc == nil {
		return nil, errors.New("akun tidak ditemukan")
	}

	var newBalance int64
	switch input.Type {
	case model.TransactionTypeExpense:
		newBalance = acc.CurrentBalance - input.Amount
	case model.TransactionTypeIncome:
		newBalance = acc.CurrentBalance + input.Amount
	default:
		return nil, errors.New("tipe transaksi tidak valid")
	}

	tx := &model.Transaction{
		ID:              uuid.New(),
		AccountID:       input.AccountID,
		CategoryID:      input.CategoryID,
		Amount:          input.Amount,
		Type:            input.Type,
		Description:     input.Description,
		TransactionDate: txDate,
		CreatedAt:       time.Now(),
	}

	if err := s.txRepo.CreateWithAccountMutation(ctx, tx, newBalance); err != nil {
		return nil, err
	}

	return tx, nil
}

func (s *TransactionService) DeleteTransaction(ctx context.Context, id uuid.UUID) error {
	tx, err := s.txRepo.GetByID(ctx, id)
	if err != nil || tx == nil {
		return errors.New("transaksi tidak ditemukan")
	}

	acc, err := s.accountRepo.GetByID(ctx, tx.AccountID)
	if err != nil || acc == nil {
		return errors.New("akun terkait tidak ditemukan")
	}

	var restoredBalance int64
	switch tx.Type {
	case model.TransactionTypeExpense:
		// Mengembalikan saldo pengeluaran
		restoredBalance = acc.CurrentBalance + tx.Amount
	case model.TransactionTypeIncome:
		// Mengurangi kembali saldo pemasukan yang dibatalkan
		restoredBalance = acc.CurrentBalance - tx.Amount
	}

	return s.txRepo.DeleteWithAccountReversal(ctx, tx.ID, acc.ID, restoredBalance)
}

func (s *TransactionService) ListTransactionsByMonth(ctx context.Context, year int, month int) ([]model.Transaction, error) {
	return s.txRepo.ListByMonth(ctx, year, month)
}
