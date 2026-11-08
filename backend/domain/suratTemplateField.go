package domain

import (
	"context"
	"time"
)

const (
	FieldTipeText     = "text"
	FieldTipeTextarea = "textarea"
	FieldTipeDate     = "date"
	FieldTipeNumber   = "number"
	FieldTipeSelect   = "select"
)

var ValidFieldTipe = map[string]bool{
	FieldTipeText:     true,
	FieldTipeTextarea: true,
	FieldTipeDate:     true,
	FieldTipeNumber:   true,
	FieldTipeSelect:   true,
}

type SuratTemplateField struct {
	ID         int
	IDTemplate int
	FieldKey   string
	Label      string
	Tipe       string
	Options    []string
	Required   bool
	Urutan     int
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

type SuratTemplateFieldRepository interface {
	GetByTemplateID(ctx context.Context, templateID int) ([]SuratTemplateField, error)
	SyncFields(ctx context.Context, templateID int, fields []SuratTemplateField) error
}
