package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/akhdan/finance-tracker/backend/internal/model"
	"github.com/akhdan/finance-tracker/backend/internal/service"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type TransactionHandler struct {
	svc *service.TransactionService
}

func NewTransactionHandler(svc *service.TransactionService) *TransactionHandler {
	return &TransactionHandler{svc: svc}
}

func (h *TransactionHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input model.CreateTransactionInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "format JSON tidak valid")
		return
	}

	tx, err := h.svc.CreateTransaction(r.Context(), input)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondJSON(w, http.StatusCreated, tx)
}

func (h *TransactionHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "ID transaksi tidak valid")
		return
	}

	if err := h.svc.DeleteTransaction(r.Context(), id); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "transaksi berhasil dihapus"})
}

func (h *TransactionHandler) ListByMonth(w http.ResponseWriter, r *http.Request) {
	monthParam := r.URL.Query().Get("month")
	now := time.Now()
	year := now.Year()
	month := int(now.Month())

	if monthParam != "" {
		parts := strings.Split(monthParam, "-")
		if len(parts) == 2 {
			if y, err := strconv.Atoi(parts[0]); err == nil {
				year = y
			}
			if m, err := strconv.Atoi(parts[1]); err == nil && m >= 1 && m <= 12 {
				month = m
			}
		}
	}

	transactions, err := h.svc.ListTransactionsByMonth(r.Context(), year, month)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "gagal mengambil daftar mutasi")
		return
	}

	if transactions == nil {
		transactions = []model.Transaction{}
	}

	respondJSON(w, http.StatusOK, transactions)
}
