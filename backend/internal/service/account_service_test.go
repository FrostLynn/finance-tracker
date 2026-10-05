package service_test

import (
	"context"
	"testing"
	"time"

	"github.com/akhdan/finance-tracker/backend/internal/model"
	"github.com/akhdan/finance-tracker/backend/internal/service"
	"github.com/google/uuid"
)

type mockAccountRepo struct {
	accounts []model.Account
}

func (m *mockAccountRepo) Create(ctx context.Context, acc *model.Account) error {
	m.accounts = append(m.accounts, *acc)
	return nil
}

func (m *mockAccountRepo) GetByID(ctx context.Context, id uuid.UUID) (*model.Account, error) {
	for _, acc := range m.accounts {
		if acc.ID == id {
			return &acc, nil
		}
	}
	return nil, nil
}

func (m *mockAccountRepo) List(ctx context.Context) ([]model.Account, error) {
	return m.accounts, nil
}

func (m *mockAccountRepo) UpdateBalance(ctx context.Context, id uuid.UUID, newBalance int64) error {
	for i, acc := range m.accounts {
		if acc.ID == id {
			m.accounts[i].CurrentBalance = newBalance
			return nil
		}
	}
	return nil
}

func (m *mockAccountRepo) Delete(ctx context.Context, id uuid.UUID) error {
	var remaining []model.Account
	for _, acc := range m.accounts {
		if acc.ID != id {
			remaining = append(remaining, acc)
		}
	}
	m.accounts = remaining
	return nil
}

func TestAccountService_CalculateTotals(t *testing.T) {
	dueDay := 25
	accounts := []model.Account{
		{
			ID:             uuid.New(),
			Name:           "BCA Tabungan",
			Type:           model.AccountTypeBank,
			CurrentBalance: 8200000,
			CreatedAt:      time.Now(),
		},
		{
			ID:             uuid.New(),
			Name:           "GoPay",
			Type:           model.AccountTypeEWallet,
			CurrentBalance: 350000,
			CreatedAt:      time.Now(),
		},
		{
			ID:             uuid.New(),
			Name:           "ShopeePay",
			Type:           model.AccountTypeEWallet,
			CurrentBalance: 120000,
			CreatedAt:      time.Now(),
		},
		{
			ID:             uuid.New(),
			Name:           "SPayLater",
			Type:           model.AccountTypePaylater,
			CurrentBalance: -1450000,
			CreditLimit:    5000000,
			DueDayOfMonth:  &dueDay,
			CreatedAt:      time.Now(),
		},
	}

	svc := service.NewAccountService(&mockAccountRepo{})
	totals := svc.CalculateTotals(accounts)

	expectedLiquid := int64(8200000 + 350000 + 120000) // 8670000
	if totals.TotalLiquidBalance != expectedLiquid {
		t.Errorf("expected liquid balance %d, got %d", expectedLiquid, totals.TotalLiquidBalance)
	}

	expectedDebt := int64(1450000)
	if totals.TotalPaylaterDebt != expectedDebt {
		t.Errorf("expected paylater debt %d, got %d", expectedDebt, totals.TotalPaylaterDebt)
	}
}

func TestAccountService_CreateAccount_Validation(t *testing.T) {
	svc := service.NewAccountService(&mockAccountRepo{})

	// Empty name
	_, err := svc.CreateAccount(context.Background(), model.CreateAccountInput{
		Name: "",
		Type: model.AccountTypeBank,
	})
	if err == nil {
		t.Error("expected error for empty name, got nil")
	}

	// Invalid type
	_, err = svc.CreateAccount(context.Background(), model.CreateAccountInput{
		Name: "Test",
		Type: "INVALID_TYPE",
	})
	if err == nil {
		t.Error("expected error for invalid type, got nil")
	}

	// Invalid Paylater due day (> 31)
	invalidDueDay := 35
	_, err = svc.CreateAccount(context.Background(), model.CreateAccountInput{
		Name:          "Paylater X",
		Type:          model.AccountTypePaylater,
		DueDayOfMonth: &invalidDueDay,
	})
	if err == nil {
		t.Error("expected error for due day > 31, got nil")
	}
}
