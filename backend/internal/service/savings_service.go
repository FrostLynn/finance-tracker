package service

import (
	"context"
	"time"

	"github.com/akhdan/finance-tracker/backend/internal/model"
	"github.com/akhdan/finance-tracker/backend/internal/repository"
	"github.com/google/uuid"
)

type SavingsService struct {
	repo repository.SavingsRepository
}

func NewSavingsService(repo repository.SavingsRepository) *SavingsService {
	return &SavingsService{repo: repo}
}

func (s *SavingsService) CreateGoal(ctx context.Context, input model.CreateSavingsInput) (*model.SavingsGoal, error) {
	targetDate, err := input.Validate()
	if err != nil {
		return nil, err
	}

	goal := &model.SavingsGoal{
		ID:            uuid.New(),
		Name:          input.Name,
		TargetAmount:  input.TargetAmount,
		CurrentAmount: 0,
		TargetDate:    targetDate,
		Icon:          input.Icon,
		CreatedAt:     time.Now(),
	}

	if err := s.repo.Create(ctx, goal); err != nil {
		return nil, err
	}

	return goal, nil
}

func (s *SavingsService) ListGoals(ctx context.Context) ([]model.SavingsGoal, error) {
	return s.repo.List(ctx)
}

func (s *SavingsService) Deposit(ctx context.Context, id uuid.UUID, input model.DepositSavingsInput) error {
	if err := input.Validate(); err != nil {
		return err
	}
	return s.repo.AddDeposit(ctx, id, input.Amount)
}

func (s *SavingsService) DeleteGoal(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}
