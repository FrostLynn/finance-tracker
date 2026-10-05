package model

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type AccountType string

const (
	AccountTypeBank     AccountType = "BANK"
	AccountTypeEWallet  AccountType = "EWALLET"
	AccountTypePaylater AccountType = "PAYLATER"
	AccountTypeCash     AccountType = "CASH"
)

func (t AccountType) IsValid() bool {
	switch t {
	case AccountTypeBank, AccountTypeEWallet, AccountTypePaylater, AccountTypeCash:
		return true
	default:
		return false
	}
}

type Account struct {
	ID             uuid.UUID   `json:"id"`
	Name           string      `json:"name"`
	Type           AccountType `json:"type"`
	CurrentBalance int64       `json:"current_balance"`
	CreditLimit    int64       `json:"credit_limit"`
	DueDayOfMonth  *int        `json:"due_day_of_month,omitempty"`
	CreatedAt      time.Time   `json:"created_at"`
	UpdatedAt      time.Time   `json:"updated_at"`
}

type CreateAccountInput struct {
	Name           string      `json:"name"`
	Type           AccountType `json:"type"`
	CurrentBalance int64       `json:"current_balance"`
	CreditLimit    int64       `json:"credit_limit"`
	DueDayOfMonth  *int        `json:"due_day_of_month,omitempty"`
}

func (input *CreateAccountInput) Validate() error {
	if input.Name == "" {
		return errors.New("nama akun tidak boleh kosong")
	}
	if !input.Type.IsValid() {
		return errors.New("tipe akun tidak valid (harus BANK, EWALLET, PAYLATER, atau CASH)")
	}
	if input.Type == AccountTypePaylater {
		if input.DueDayOfMonth != nil {
			if *input.DueDayOfMonth < 1 || *input.DueDayOfMonth > 31 {
				return errors.New("tanggal jatuh tempo paylater harus antara tanggal 1 sampai 31")
			}
		}
	}
	return nil
}

type AccountTotals struct {
	TotalLiquidBalance int64 `json:"total_liquid_balance"`
	TotalPaylaterDebt  int64 `json:"total_paylater_debt"`
}
