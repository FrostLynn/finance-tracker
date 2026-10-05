package handler

import (
	"encoding/json"
	"net/http"

	"github.com/akhdan/finance-tracker/backend/internal/model"
	"github.com/akhdan/finance-tracker/backend/internal/service"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type SavingsHandler struct {
	svc *service.SavingsService
}

func NewSavingsHandler(svc *service.SavingsService) *SavingsHandler {
	return &SavingsHandler{svc: svc}
}

func (h *SavingsHandler) List(w http.ResponseWriter, r *http.Request) {
	goals, err := h.svc.ListGoals(r.Context())
	if err != nil {
		respondError(w, http.StatusInternalServerError, "gagal mengambil daftar target tabungan")
		return
	}
	if goals == nil {
		goals = []model.SavingsGoal{}
	}
	respondJSON(w, http.StatusOK, goals)
}

func (h *SavingsHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input model.CreateSavingsInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "format JSON tidak valid")
		return
	}

	goal, err := h.svc.CreateGoal(r.Context(), input)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondJSON(w, http.StatusCreated, goal)
}

func (h *SavingsHandler) Deposit(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "ID tabungan tidak valid")
		return
	}

	var input model.DepositSavingsInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "format JSON tidak valid")
		return
	}

	if err := h.svc.Deposit(r.Context(), id, input); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "tabungan berhasil ditambahkan"})
}

func (h *SavingsHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "ID tabungan tidak valid")
		return
	}

	if err := h.svc.DeleteGoal(r.Context(), id); err != nil {
		respondError(w, http.StatusInternalServerError, "gagal menghapus target tabungan")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "target tabungan berhasil dihapus"})
}
