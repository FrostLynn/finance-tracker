package service

import (
	"context"
	"time"

	"github.com/akhdan/finance-tracker/backend/internal/model"
	"github.com/akhdan/finance-tracker/backend/internal/repository"
	"github.com/google/uuid"
)

type AccountService struct {
	repo repository.AccountRepository
}

func NewAccountService(repo repository.AccountRepository) *AccountService {
	return &AccountService{repo: repo}
}

func (s *AccountService) CreateAccount(ctx context.Context, input model.CreateAccountInput) (*model.Account, error) {
	if err := input.Validate(); err != nil {
		return nil, err
	}

	acc := &model.Account{
		ID:             uuid.New(),
		Name:           input.Name,
		Type:           input.Type,
		CurrentBalance: input.CurrentBalance,
		CreditLimit:    input.CreditLimit,
		DueDayOfMonth:  input.DueDayOfMonth,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if err := s.repo.Create(ctx, acc); err != nil {
		return nil, err
	}

	return acc, nil
}

func (s *AccountService) GetAccounts(ctx context.Context) ([]model.Account, *model.AccountTotals, error) {
	accounts, err := s.repo.List(ctx)
	if err != nil {
		return nil, nil, err
	}

	totals := s.CalculateTotals(accounts)
	return accounts, totals, nil
}

func (s *AccountService) CalculateTotals(accounts []model.Account) *model.AccountTotals {
	totals := &model.AccountTotals{
		TotalLiquidBalance: 0,
		TotalPaylaterDebt:  0,
	}

	for _, acc := range accounts {
		switch acc.Type {
		case model.AccountTypeBank, model.AccountTypeEWallet, model.AccountTypeCash:
			if acc.CurrentBalance > 0 {
				totals.TotalLiquidBalance += acc.CurrentBalance
			}
		case model.AccountTypePaylater:
			if acc.CurrentBalance < 0 {
				// Saldo negatif pada paylater merefleksikan utang yang belum dibayar
				totals.TotalPaylaterDebt += -acc.CurrentBalance
			}
		}
	}

	return totals
}
