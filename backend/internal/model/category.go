package model

import (
	"time"

	"github.com/google/uuid"
)

type Category struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Type      string    `json:"type"` // EXPENSE or INCOME
	Icon      string    `json:"icon"`
	CreatedAt time.Time `json:"created_at"`
}
