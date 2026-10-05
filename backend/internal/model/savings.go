package model

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type SavingsGoal struct {
	ID            uuid.UUID  `json:"id"`
	Name          string     `json:"name"`
	TargetAmount  int64      `json:"target_amount"`
	CurrentAmount int64      `json:"current_amount"`
	TargetDate    *time.Time `json:"target_date,omitempty"`
	Icon          string     `json:"icon"`
	CreatedAt     time.Time  `json:"created_at"`
}

type CreateSavingsInput struct {
	Name         string `json:"name"`
	TargetAmount int64  `json:"target_amount"`
	TargetDate   string `json:"target_date,omitempty"` // YYYY-MM-DD
	Icon         string `json:"icon,omitempty"`
}

func (input *CreateSavingsInput) Validate() (*time.Time, error) {
	if input.Name == "" {
		return nil, errors.New("nama impian/target tabungan tidak boleh kosong")
	}
	if input.TargetAmount <= 0 {
		return nil, errors.New("target tabungan harus lebih besar dari 0")
	}

	var parsedDate *time.Time
	if input.TargetDate != "" {
		d, err := time.Parse("2006-01-02", input.TargetDate)
		if err != nil {
			return nil, errors.New("format tanggal target tidak valid (gunakan YYYY-MM-DD)")
		}
		parsedDate = &d
	}

	if input.Icon == "" {
		input.Icon = "piggy-bank"
	}

	return parsedDate, nil
}

type DepositSavingsInput struct {
	Amount int64 `json:"amount"`
}

func (input *DepositSavingsInput) Validate() error {
	if input.Amount <= 0 {
		return errors.New("nominal tabungan harus lebih besar dari 0")
	}
	return nil
}
