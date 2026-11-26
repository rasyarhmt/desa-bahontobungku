package usecase

import (
	"context"
	"fmt"
	"strings"
	"unicode/utf8"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
)

const maxFieldKeyLength = 100

func validateFieldKeyLength(key string) error {
	if utf8.RuneCountInString(key) <= maxFieldKeyLength {
		return nil
	}
	shown := key
	if runes := []rune(key); len(runes) > 40 {
		shown = string(runes[:40]) + "..."
	}
	return domain.NewValidation(fmt.Sprintf(
		"field %q terlalu panjang (maksimal %d karakter)",
		shown, maxFieldKeyLength,
	))
}

func humanizeFieldKey(key string) string {
	words := strings.Split(key, "_")
	for i, w := range words {
		if w == "" {
			continue
		}
		words[i] = strings.ToUpper(w[:1]) + w[1:]
	}
	return strings.Join(words, " ")
}

func defaultFieldTipe(key string) string {
	lower := strings.ToLower(key)
	if lower == "jenis_kelamin" || lower == "agama" {
		return domain.FieldTipeSelect
	}
	if strings.Contains(lower, "tanggal") || strings.Contains(lower, "tgl") {
		return domain.FieldTipeDate
	}
	return domain.FieldTipeText
}

func defaultFieldOptions(key string) []string {
	switch strings.ToLower(key) {
	case "jenis_kelamin":
		return []string{"Laki-laki", "Perempuan"}
	case "agama":
		return []string{"Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"}
	default:
		return []string{}
	}
}

func defaultTemplateField(key string, urutan int) domain.SuratTemplateField {
	return domain.SuratTemplateField{
		FieldKey: key,
		Label:    humanizeFieldKey(key),
		Tipe:     defaultFieldTipe(key),
		Options:  defaultFieldOptions(key),
		Required: true,
		Urutan:   urutan,
	}
}

func mergeTemplateFields(
	existing []domain.SuratTemplateField,
	placeholders []string,
) []domain.SuratTemplateField {
	allowed := make(map[string]bool)
	orderedKeys := make([]string, 0, len(placeholders))
	for _, raw := range placeholders {
		key := strings.TrimSpace(raw)
		if key == "" || key == "nama_pemohon" || key == "nik_pemohon" || key == "tanggal_surat" {
			continue
		}
		if allowed[key] {
			continue
		}
		allowed[key] = true
		orderedKeys = append(orderedKeys, key)
	}

	result := make([]domain.SuratTemplateField, 0, len(orderedKeys))
	used := make(map[string]bool)
	for _, old := range existing {
		if !allowed[old.FieldKey] || used[old.FieldKey] {
			continue
		}
		result = append(result, old)
		used[old.FieldKey] = true
	}
	for _, key := range orderedKeys {
		if used[key] {
			continue
		}
		result = append(result, defaultTemplateField(key, len(result)+1))
	}
	return result
}

func templateFieldKeysEqual(a, b []domain.SuratTemplateField) bool {
	if len(a) != len(b) {
		return false
	}
	keys := make(map[string]bool, len(a))
	for _, f := range a {
		keys[f.FieldKey] = true
	}
	if len(keys) != len(a) {
		return false
	}
	for _, f := range b {
		if !keys[f.FieldKey] {
			return false
		}
	}
	return true
}

func ensureTemplateFields(
	ctx context.Context,
	templateID int,
	content []byte,
	fieldRepo domain.SuratTemplateFieldRepository,
) ([]domain.SuratTemplateField, error) {
	placeholders, err := utils.ExtractDOCXPlaceholders(content)
	if err != nil {
		return nil, domain.NewInternal("Gagal membaca field template", err)
	}
	for _, raw := range placeholders {
		if err := validateFieldKeyLength(strings.TrimSpace(raw)); err != nil {
			return nil, err
		}
	}

	existing, err := fieldRepo.GetByTemplateID(ctx, templateID)
	if err != nil {
		return nil, err
	}

	merged := mergeTemplateFields(existing, placeholders)
	if !templateFieldKeysEqual(existing, merged) {
		if err := fieldRepo.SyncFields(ctx, templateID, merged); err != nil {
			return nil, err
		}
	}
	return merged, nil
}

func templateFieldToDTO(f domain.SuratTemplateField) dto.TemplateFieldDTO {
	options := f.Options
	if options == nil {
		options = []string{}
	}
	return dto.TemplateFieldDTO{
		Key:      f.FieldKey,
		Label:    f.Label,
		Tipe:     f.Tipe,
		Options:  options,
		Required: f.Required,
		Urutan:   f.Urutan,
	}
}

func templateFieldsToDTO(fields []domain.SuratTemplateField) []dto.TemplateFieldDTO {
	result := make([]dto.TemplateFieldDTO, 0, len(fields))
	for _, f := range fields {
		result = append(result, templateFieldToDTO(f))
	}
	return result
}
