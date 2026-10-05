package service

import (
	"context"
	"fmt"
	"math"

	"github.com/akhdan/finance-tracker/backend/internal/model"
	"github.com/akhdan/finance-tracker/backend/internal/repository"
	"github.com/google/uuid"
)

type SummaryTransactionRepository interface {
	ListByMonth(ctx context.Context, year int, month int) ([]model.Transaction, error)
}

type SummaryService struct {
	txRepo      SummaryTransactionRepository
	accountRepo repository.AccountRepository
}

func NewSummaryService(txRepo SummaryTransactionRepository, accountRepo repository.AccountRepository) *SummaryService {
	return &SummaryService{
		txRepo:      txRepo,
		accountRepo: accountRepo,
	}
}

func (s *SummaryService) GetMonthlySummary(ctx context.Context, year int, month int) (*model.MonthlySummary, error) {
	transactions, err := s.txRepo.ListByMonth(ctx, year, month)
	if err != nil {
		return nil, err
	}

	accounts, err := s.accountRepo.List(ctx)
	if err != nil {
		return nil, err
	}

	summary := &model.MonthlySummary{
		Month:                 fmt.Sprintf("%04d-%02d", year, month),
		TotalIncome:           0,
		TotalExpense:          0,
		NetCashflow:           0,
		SavingsRatePercentage: 0,
		ActivePaylaterBill:    0,
		CategoryBreakdown:     []model.CategoryBreakdown{},
	}

	type catStat struct {
		id    uuid.UUID
		name  string
		icon  string
		total int64
		count int
	}
	categoryMap := make(map[uuid.UUID]*catStat)

	for _, tx := range transactions {
		switch tx.Type {
		case model.TransactionTypeIncome:
			summary.TotalIncome += tx.Amount
		case model.TransactionTypeExpense:
			summary.TotalExpense += tx.Amount

			stat, exists := categoryMap[tx.CategoryID]
			if !exists {
				stat = &catStat{
					id:    tx.CategoryID,
					name:  tx.CategoryName,
					icon:  tx.CategoryIcon,
					total: 0,
					count: 0,
				}
				categoryMap[tx.CategoryID] = stat
			}
			stat.total += tx.Amount
			stat.count++
		}
	}

	summary.NetCashflow = summary.TotalIncome - summary.TotalExpense

	// Savings rate %: (NetCashflow / TotalIncome) * 100
	if summary.TotalIncome > 0 && summary.NetCashflow > 0 {
		rate := (float64(summary.NetCashflow) / float64(summary.TotalIncome)) * 100.0
		summary.SavingsRatePercentage = math.Round(rate*10) / 10
	}

	// Calculate Paylater active debt
	for _, acc := range accounts {
		if acc.Type == model.AccountTypePaylater && acc.CurrentBalance < 0 {
			summary.ActivePaylaterBill += -acc.CurrentBalance
		}
	}

	// Calculate Category percentages
	for _, stat := range categoryMap {
		var pct float64
		if summary.TotalExpense > 0 {
			pct = math.Round((float64(stat.total)/float64(summary.TotalExpense))*1000) / 10
		}
		summary.CategoryBreakdown = append(summary.CategoryBreakdown, model.CategoryBreakdown{
			CategoryID:       stat.id,
			CategoryName:     stat.name,
			CategoryIcon:     stat.icon,
			TotalAmount:      stat.total,
			Percentage:       pct,
			TransactionCount: stat.count,
		})
	}

	return summary, nil
}
