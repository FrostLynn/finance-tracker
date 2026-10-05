package handler_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/akhdan/finance-tracker/backend/internal/handler"
	"github.com/akhdan/finance-tracker/backend/internal/model"
	"github.com/akhdan/finance-tracker/backend/internal/service"
	"github.com/google/uuid"
)

type dummyAccountRepo struct {
	accounts []model.Account
}

func (d *dummyAccountRepo) Create(ctx context.Context, acc *model.Account) error {
	d.accounts = append(d.accounts, *acc)
	return nil
}

func (d *dummyAccountRepo) GetByID(ctx context.Context, id uuid.UUID) (*model.Account, error) {
	for _, acc := range d.accounts {
		if acc.ID == id {
			return &acc, nil
		}
	}
	return nil, nil
}

func (d *dummyAccountRepo) List(ctx context.Context) ([]model.Account, error) {
	return d.accounts, nil
}

func (d *dummyAccountRepo) UpdateBalance(ctx context.Context, id uuid.UUID, newBal int64) error {
	return nil
}

func (d *dummyAccountRepo) Delete(ctx context.Context, id uuid.UUID) error {
	return nil
}

type dummyTxRepo struct {
	txs []model.Transaction
}

func (d *dummyTxRepo) CreateWithAccountMutation(ctx context.Context, tx *model.Transaction, newBal int64) error {
	d.txs = append(d.txs, *tx)
	return nil
}

func (d *dummyTxRepo) GetByID(ctx context.Context, id uuid.UUID) (*model.Transaction, error) {
	for _, tx := range d.txs {
		if tx.ID == id {
			return &tx, nil
		}
	}
	return nil, nil
}

func (d *dummyTxRepo) DeleteWithAccountReversal(ctx context.Context, txID uuid.UUID, accountID uuid.UUID, restoredBalance int64) error {
	return nil
}

func (d *dummyTxRepo) ListByMonth(ctx context.Context, year int, month int) ([]model.Transaction, error) {
	return d.txs, nil
}

type dummyCategoryRepo struct{}

func (d *dummyCategoryRepo) List(ctx context.Context) ([]model.Category, error) {
	return []model.Category{
		{ID: uuid.New(), Name: "Makan & Minum", Type: "EXPENSE", Icon: "utensils"},
	}, nil
}

func setupTestRouter() http.Handler {
	accRepo := &dummyAccountRepo{
		accounts: []model.Account{
			{ID: uuid.New(), Name: "BCA", Type: model.AccountTypeBank, CurrentBalance: 5000000},
		},
	}
	txRepo := &dummyTxRepo{}
	catRepo := &dummyCategoryRepo{}

	accSvc := service.NewAccountService(accRepo)
	txSvc := service.NewTransactionService(txRepo, accRepo)
	sumSvc := service.NewSummaryService(txRepo, accRepo)

	return handler.NewRouter(handler.RouterDependencies{
		AccountHandler:     handler.NewAccountHandler(accSvc),
		TransactionHandler: handler.NewTransactionHandler(txSvc),
		SummaryHandler:     handler.NewSummaryHandler(sumSvc),
		CategoryHandler:    handler.NewCategoryHandler(catRepo),
		SavingsHandler:     handler.NewSavingsHandler(service.NewSavingsService(nil)),
		SystemHandler:      handler.NewSystemHandler(nil),
	})
}

func TestHealthCheck(t *testing.T) {
	router := setupTestRouter()

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rr := httptest.NewRecorder()

	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rr.Code)
	}
	if !strings.Contains(rr.Body.String(), "healthy") {
		t.Errorf("expected body to contain 'healthy', got %s", rr.Body.String())
	}
}

func TestAccountEndpoints(t *testing.T) {
	router := setupTestRouter()

	req := httptest.NewRequest(http.MethodGet, "/api/accounts", nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rr.Code)
	}
	if !strings.Contains(rr.Body.String(), "BCA") {
		t.Errorf("expected response to contain 'BCA', got %s", rr.Body.String())
	}
}

func TestSummaryEndpoint(t *testing.T) {
	router := setupTestRouter()

	req := httptest.NewRequest(http.MethodGet, "/api/summary?month=2026-10", nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rr.Code)
	}
	if !strings.Contains(rr.Body.String(), "total_income") {
		t.Errorf("expected response to contain 'total_income', got %s", rr.Body.String())
	}
}
