package model

import "github.com/google/uuid"

type CategoryBreakdown struct {
	CategoryID       uuid.UUID `json:"category_id"`
	CategoryName     string    `json:"category_name"`
	CategoryIcon     string    `json:"category_icon"`
	TotalAmount      int64     `json:"total_amount"`
	Percentage       float64   `json:"percentage"`
	TransactionCount int       `json:"transaction_count"`
}

type MonthlySummary struct {
	Month                 string              `json:"month"` // YYYY-MM
	TotalIncome           int64               `json:"total_income"`
	TotalExpense          int64               `json:"total_expense"`
	NetCashflow           int64               `json:"net_cashflow"`
	SavingsRatePercentage float64             `json:"savings_rate_percentage"`
	ActivePaylaterBill    int64               `json:"active_paylater_bill"`
	CategoryBreakdown     []CategoryBreakdown `json:"category_breakdown"`
}
