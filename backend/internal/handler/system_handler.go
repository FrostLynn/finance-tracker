package handler

import (
	"context"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
)

type SystemHandler struct {
	pool *pgxpool.Pool
}

func NewSystemHandler(pool *pgxpool.Pool) *SystemHandler {
	return &SystemHandler{pool: pool}
}

func (h *SystemHandler) ResetAllData(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	// Truncate/Delete all data from transactions, savings_goals, and accounts
	query := `
		DELETE FROM transactions;
		DELETE FROM savings_goals;
		DELETE FROM accounts;
	`
	_, err := h.pool.Exec(ctx, query)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "gagal mereset data: "+err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"message": "seluruh data mutasi, akun, dan tabungan berhasil direset ke 0",
	})
}
