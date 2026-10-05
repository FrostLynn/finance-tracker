package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/akhdan/finance-tracker/backend/internal/handler"
	"github.com/akhdan/finance-tracker/backend/internal/repository"
	"github.com/akhdan/finance-tracker/backend/internal/service"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://postgres:postgres@localhost:5432/financetrack?sslmode=disable"
	}

	ctx := context.Background()
	log.Printf("Connecting to PostgreSQL at %s ...", databaseURL)

	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		log.Fatalf("Invalid DATABASE_URL: %v", err)
	}
	config.MaxConns = 25
	config.MinConns = 2

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("Database ping failed: %v", err)
	}
	log.Println("PostgreSQL connection established successfully.")

	// Initialize repositories
	accountRepo := repository.NewPostgresAccountRepository(pool)
	txRepo := repository.NewPostgresTransactionRepository(pool)
	catRepo := repository.NewPostgresCategoryRepository(pool)

	// Initialize services
	accountSvc := service.NewAccountService(accountRepo)
	txSvc := service.NewTransactionService(txRepo, accountRepo)
	summarySvc := service.NewSummaryService(txRepo, accountRepo)

	// Initialize handlers & router
	r := handler.NewRouter(handler.RouterDependencies{
		AccountHandler:     handler.NewAccountHandler(accountSvc),
		TransactionHandler: handler.NewTransactionHandler(txSvc),
		SummaryHandler:     handler.NewSummaryHandler(summarySvc),
		CategoryHandler:    handler.NewCategoryHandler(catRepo),
	})

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("FinanceFlow API server running on port %s", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server ListenAndServe failed: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down FinanceFlow API server...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited cleanly.")
}
