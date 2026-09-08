package utils

import (
	"errors"

	qrcode "github.com/skip2/go-qrcode"
)

// GenerateQRPNG membuat gambar QR berisi payload dalam format PNG.
func GenerateQRPNG(payload string, size int) ([]byte, error) {
	if payload == "" {
		return nil, errors.New("payload QR tidak boleh kosong")
	}
	if size <= 0 {
		size = 256
	}
	return qrcode.Encode(payload, qrcode.Medium, size)
}
