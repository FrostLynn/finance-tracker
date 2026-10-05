package handler

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/akhdan/finance-tracker/backend/internal/service"
)

type SummaryHandler struct {
	svc *service.SummaryService
}

func NewSummaryHandler(svc *service.SummaryService) *SummaryHandler {
	return &SummaryHandler{svc: svc}
}

func (h *SummaryHandler) GetSummary(w http.ResponseWriter, r *http.Request) {
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

	summary, err := h.svc.GetMonthlySummary(r.Context(), year, month)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "gagal menghitung ringkasan bulanan")
		return
	}

	respondJSON(w, http.StatusOK, summary)
}
