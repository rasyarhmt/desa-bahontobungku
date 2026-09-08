package utils

import (
	"crypto/rand"
)

const codeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

// GenerateCode menghasilkan kode acak alfanumerik (tanpa karakter ambigu)
// untuk verifikasi publik, misal kode_unik pada log cetak surat.
func GenerateCode(length int) (string, error) {
	if length <= 0 {
		length = 10
	}
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	for i := range b {
		b[i] = codeAlphabet[int(b[i])%len(codeAlphabet)]
	}
	return string(b), nil
}
