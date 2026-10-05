package service_test

import (
	"context"
	"testing"

	"github.com/akhdan/finance-tracker/backend/internal/model"
	"github.com/akhdan/finance-tracker/backend/internal/service"
	"github.com/google/uuid"
)

type mockSummaryTxRepo struct {
	transactions []model.Transaction
}

func (m *mockSummaryTxRepo) ListByMonth(ctx context.Context, year int, month int) ([]model.Transaction, error) {
	return m.transactions, nil
}

func TestSummaryService_CalculateSummary(t *testing.T) {
	foodCatID := uuid.New()
	transportCatID := uuid.New()
	salaryCatID := uuid.New()

	transactions := []model.Transaction{
		{
			Amount:       12500000,
			Type:         model.TransactionTypeIncome,
			CategoryID:   salaryCatID,
			CategoryName: "Gaji Utama",
			CategoryIcon: "briefcase",
		},
		{
			Amount:       35000,
			Type:         model.TransactionTypeExpense,
			CategoryID:   foodCatID,
			CategoryName: "Makan & Minum",
			CategoryIcon: "utensils",
		},
		{
			Amount:       65000,
			Type:         model.TransactionTypeExpense,
			CategoryID:   foodCatID,
			CategoryName: "Makan & Minum",
			CategoryIcon: "utensils",
		},
		{
			Amount:       100000,
			Type:         model.TransactionTypeExpense,
			CategoryID:   transportCatID,
			CategoryName: "Transportasi",
			CategoryIcon: "car",
		},
	}

	accounts := []model.Account{
		{
			Type:           model.AccountTypeBank,
			CurrentBalance: 12000000,
		},
		{
			Type:           model.AccountTypePaylater,
			CurrentBalance: -1450000, // active paylater debt
		},
	}

	svc := service.NewSummaryService(&mockSummaryTxRepo{transactions: transactions}, &mockAccountRepo{accounts: accounts})

	summary, err := svc.GetMonthlySummary(context.Background(), 2026, 10)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if summary.TotalIncome != 12500000 {
		t.Errorf("expected total income 12500000, got %d", summary.TotalIncome)
	}

	expectedExpense := int64(35000 + 65000 + 100000) // 200.000
	if summary.TotalExpense != expectedExpense {
		t.Errorf("expected total expense %d, got %d", expectedExpense, summary.TotalExpense)
	}

	expectedNet := int64(12500000 - 200000) // 12.300.000
	if summary.NetCashflow != expectedNet {
		t.Errorf("expected net cashflow %d, got %d", expectedNet, summary.NetCashflow)
	}

	if summary.ActivePaylaterBill != 1450000 {
		t.Errorf("expected paylater bill 1450000, got %d", summary.ActivePaylaterBill)
	}

	// Breakdown length should be 2 categories (Makan & Minum and Transportasi)
	if len(summary.CategoryBreakdown) != 2 {
		t.Fatalf("expected 2 expense categories, got %d", len(summary.CategoryBreakdown))
	}
}

func TestSummaryService_ZeroIncomeDivisionByZero(t *testing.T) {
	transactions := []model.Transaction{
		{
			Amount:       50000,
			Type:         model.TransactionTypeExpense,
			CategoryID:   uuid.New(),
			CategoryName: "Belanja",
		},
	}

	svc := service.NewSummaryService(&mockSummaryTxRepo{transactions: transactions}, &mockAccountRepo{})

	summary, err := svc.GetMonthlySummary(context.Background(), 2026, 10)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if summary.SavingsRatePercentage != 0.0 {
		t.Errorf("expected 0.0 savings rate on zero income, got %f", summary.SavingsRatePercentage)
	}
}
