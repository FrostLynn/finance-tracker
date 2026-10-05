package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

type RouterDependencies struct {
	AccountHandler     *AccountHandler
	TransactionHandler *TransactionHandler
	SummaryHandler     *SummaryHandler
	CategoryHandler    *CategoryHandler
	SavingsHandler     *SavingsHandler
	SystemHandler      *SystemHandler
}

func NewRouter(deps RouterDependencies) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		respondJSON(w, http.StatusOK, map[string]string{
			"status": "healthy",
		})
	})

	r.Route("/api", func(api chi.Router) {
		// Accounts
		api.Route("/accounts", func(acc chi.Router) {
			acc.Get("/", deps.AccountHandler.List)
			acc.Post("/", deps.AccountHandler.Create)
			acc.Delete("/{id}", deps.AccountHandler.Delete)
		})

		// Transactions
		api.Route("/transactions", func(tx chi.Router) {
			tx.Get("/", deps.TransactionHandler.ListByMonth)
			tx.Post("/", deps.TransactionHandler.Create)
			tx.Delete("/{id}", deps.TransactionHandler.Delete)
		})

		// Savings Goals (Nabung)
		api.Route("/savings", func(sav chi.Router) {
			sav.Get("/", deps.SavingsHandler.List)
			sav.Post("/", deps.SavingsHandler.Create)
			sav.Post("/{id}/deposit", deps.SavingsHandler.Deposit)
			sav.Delete("/{id}", deps.SavingsHandler.Delete)
		})

		// Summary
		api.Get("/summary", deps.SummaryHandler.GetSummary)

		// Categories
		api.Get("/categories", deps.CategoryHandler.List)

		// System Reset (Hapus Semua Data)
		api.Post("/system/reset", deps.SystemHandler.ResetAllData)
	})

	return r
}
