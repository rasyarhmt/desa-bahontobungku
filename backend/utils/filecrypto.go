package utils

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
)

const (
	TemplateUploadDir = "uploads/templates"
	EncryptedExt      = ".html.enc"
)

// EnsureDir membuat folder jika belum ada
func EnsureDir(dir string) error {
	if dir == "" {
		return errors.New("directory tidak boleh kosong")
	}
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	return nil
}

// EncryptFileContent mengenkripsi konten file HTML lalu menyimpan sebagai .html.enc
// relPath yang dikembalikan berupa path relatif (misal templates/SK_DOMISILI.html.enc)
func EncryptFileContent(plaintext []byte, fileName string) (string, error) {
	if strings.TrimSpace(fileName) == "" {
		return "", errors.New("nama file tidak boleh kosong")
	}

	key := GetMasterKEK()
	ciphertext, err := EncryptWithKey(plaintext, key)
	if err != nil {
		return "", err
	}

	baseName := strings.TrimSuffix(fileName, filepath.Ext(fileName))

	if err := EnsureDir(TemplateUploadDir); err != nil {
		return "", err
	}

	encFileName := baseName + EncryptedExt
	fullPath := filepath.Join(TemplateUploadDir, encFileName)
	if err := os.WriteFile(fullPath, ciphertext, 0o644); err != nil {
		return "", err
	}

	return filepath.Join("templates", encFileName), nil
}

// DecryptFileContent membaca file .html.enc dan mengembalikan plaintext HTML
func DecryptFileContent(relPath string) ([]byte, error) {
	if relPath == "" {
		return nil, errors.New("path file tidak boleh kosong")
	}

	key := GetMasterKEK()
	fullPath := filepath.Join(TemplateUploadDir, filepath.Base(relPath))
	ciphertext, err := os.ReadFile(fullPath)
	if err != nil {
		return nil, err
	}

	return DecryptWithKey(ciphertext, key)
}

// DeleteEncryptedFile menghapus file template terenkripsi
func DeleteEncryptedFile(relPath string) error {
	if relPath == "" {
		return nil
	}
	fullPath := filepath.Join(TemplateUploadDir, filepath.Base(relPath))
	if err := os.Remove(fullPath); err != nil && !errors.Is(err, os.ErrNotExist) {
		return err
	}
	return nil
}
