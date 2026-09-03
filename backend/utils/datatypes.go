package utils

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

type DBJSON json.RawMessage

func (j DBJSON) Value() (driver.Value, error) {
	if len(j) == 0 {
		return nil, nil
	}
	return []byte(j), nil
}

func (j *DBJSON) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("gagal melakukan scan pada kolom JSON: tipe bukan []byte")
	}

	// Salin data byte agar aman di memori
	result := make([]byte, len(bytes))
	copy(result, bytes)
	*j = result
	return nil
}
