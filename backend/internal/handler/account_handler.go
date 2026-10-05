package handler

import (
	"encoding/json"
	"net/http"

	"github.com/akhdan/finance-tracker/backend/internal/model"
	"github.com/akhdan/finance-tracker/backend/internal/service"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type AccountHandler struct {
	svc *service.AccountService
}

func NewAccountHandler(svc *service.AccountService) *AccountHandler {
	return &AccountHandler{svc: svc}
}

type AccountListResponse struct {
	Accounts []model.Account      `json:"accounts"`
	Totals   *model.AccountTotals `json:"totals"`
}

func (h *AccountHandler) List(w http.ResponseWriter, r *http.Request) {
	accounts, totals, err := h.svc.GetAccounts(r.Context())
	if err != nil {
		respondError(w, http.StatusInternalServerError, "gagal mengambil daftar akun")
		return
	}
	if accounts == nil {
		accounts = []model.Account{}
	}

	respondJSON(w, http.StatusOK, AccountListResponse{
		Accounts: accounts,
		Totals:   totals,
	})
}

func (h *AccountHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input model.CreateAccountInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "format JSON tidak valid")
		return
	}

	acc, err := h.svc.CreateAccount(r.Context(), input)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondJSON(w, http.StatusCreated, acc)
}

func (h *AccountHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "ID akun tidak valid")
		return
	}

	if err := h.svc.DeleteAccount(r.Context(), id); err != nil {
		respondError(w, http.StatusInternalServerError, "gagal menghapus akun: "+err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "akun berhasil dihapus"})
}
