package model

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type TransactionType string

const (
	TransactionTypeIncome  TransactionType = "INCOME"
	TransactionTypeExpense TransactionType = "EXPENSE"
)

func (t TransactionType) IsValid() bool {
	return t == TransactionTypeIncome || t == TransactionTypeExpense
}

type Transaction struct {
	ID              uuid.UUID       `json:"id"`
	AccountID       uuid.UUID       `json:"account_id"`
	AccountName     string          `json:"account_name,omitempty"`
	CategoryID      uuid.UUID       `json:"category_id"`
	CategoryName    string          `json:"category_name,omitempty"`
	CategoryIcon    string          `json:"category_icon,omitempty"`
	Amount          int64           `json:"amount"`
	Type            TransactionType `json:"type"`
	Description     string          `json:"description"`
	TransactionDate time.Time       `json:"transaction_date"`
	CreatedAt       time.Time       `json:"created_at"`
}

type CreateTransactionInput struct {
	AccountID       uuid.UUID       `json:"account_id"`
	CategoryID      uuid.UUID       `json:"category_id"`
	Amount          int64           `json:"amount"`
	Type            TransactionType `json:"type"`
	Description     string          `json:"description"`
	TransactionDate string          `json:"transaction_date"` // YYYY-MM-DD
}

func (input *CreateTransactionInput) Validate() (time.Time, error) {
	if input.AccountID == uuid.Nil {
		return time.Time{}, errors.New("akun wajib dipilih")
	}
	if input.CategoryID == uuid.Nil {
		return time.Time{}, errors.New("kategori wajib dipilih")
	}
	if input.Amount <= 0 {
		return time.Time{}, errors.New("nominal transaksi harus lebih besar dari 0")
	}
	if !input.Type.IsValid() {
		return time.Time{}, errors.New("tipe transaksi harus INCOME atau EXPENSE")
	}
	if input.Description == "" {
		return time.Time{}, errors.New("keterangan transaksi tidak boleh kosong")
	}

	date, err := time.Parse("2006-01-02", input.TransactionDate)
	if err != nil {
		return time.Time{}, errors.New("format tanggal tidak valid, gunakan YYYY-MM-DD")
	}

	return date, nil
}
