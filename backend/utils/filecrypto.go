package utils

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const (
	TemplateUploadDir = "uploads/templates"
	SuratUploadDir    = "uploads/surat"
	BeritaUploadDir   = "uploads/berita"
	MediaUploadDir    = "uploads/media"
	AparaturUploadDir = "uploads/aparatur"
	EncryptedExt      = ".docx.enc"
	EncryptedPdfExt   = ".pdf.enc"
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

// EncryptFileContent mengenkripsi konten file template DOCX lalu menyimpan
// sebagai .docx.enc. relPath yang dikembalikan berupa path relatif
// (misal templates/SK_DOMISILI.docx.enc)
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

// DecryptFileContent membaca file .docx.enc dan mengembalikan plaintext DOCX
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

// buildArchiveFileName membuat nama unik dari nama asli file: <unix>_<sanitized>
func buildArchiveFileName(originalFilename string) string {
	base := filepath.Base(originalFilename)
	noExt := strings.TrimSuffix(base, filepath.Ext(base))
	noExt = strings.ReplaceAll(noExt, " ", "_")
	noExt = strings.ReplaceAll(noExt, "-", "_")
	timestamp := time.Now().Unix()
	return fmt.Sprintf("%d_%s", timestamp, noExt)
}

// EncryptArchiveFile mengenkripsi file arsip surat (AES-256-GCM) lalu menyimpan
// sebagai <nama>.<ext>.enc di folder uploads/surat. relPath yang dikembalikan
// berupa path relatif (misal surat/123_abc.pdf.enc).
func EncryptArchiveFile(plaintext []byte, originalFilename string) (string, error) {
	ext := filepath.Ext(originalFilename)
	baseName := buildArchiveFileName(originalFilename)

	key := GetMasterKEK()
	ciphertext, err := EncryptWithKey(plaintext, key)
	if err != nil {
		return "", err
	}

	if err := EnsureDir(SuratUploadDir); err != nil {
		return "", err
	}

	encFileName := baseName + ext + ".enc"
	fullPath := filepath.Join(SuratUploadDir, encFileName)
	if err := os.WriteFile(fullPath, ciphertext, 0o644); err != nil {
		return "", err
	}

	return filepath.Join("surat", encFileName), nil
}

// DecryptArchiveFile membaca file arsip terenkripsi dan mengembalikan plaintext
func DecryptArchiveFile(relPath string) ([]byte, error) {
	if relPath == "" {
		return nil, errors.New("path file tidak boleh kosong")
	}
	fullPath := filepath.Join(SuratUploadDir, filepath.Base(relPath))
	ciphertext, err := os.ReadFile(fullPath)
	if err != nil {
		return nil, err
	}
	return DecryptWithKey(ciphertext, GetMasterKEK())
}

// DeleteArchiveFile menghapus file arsip surat terenkripsi
func DeleteArchiveFile(relPath string) error {
	if relPath == "" {
		return nil
	}
	fullPath := filepath.Join(SuratUploadDir, filepath.Base(relPath))
	if err := os.Remove(fullPath); err != nil && !errors.Is(err, os.ErrNotExist) {
		return err
	}
	return nil
}

// EncryptSuratFile menyimpan surat hasil generate (PDF) terenkripsi sebagai
// uploads/surat/<baseName>.<ext>.enc. baseName tanpa ekstensi. Mengembalikan
// path relatif (misal surat/A1B2C3D4E5.pdf.enc).
func EncryptSuratFile(plaintext []byte, baseName string) (string, error) {
	if strings.TrimSpace(baseName) == "" {
		return "", errors.New("nama file tidak boleh kosong")
	}
	baseName = buildArchiveFileName(baseName)

	if err := EnsureDir(SuratUploadDir); err != nil {
		return "", err
	}

	key := GetMasterKEK()
	ciphertext, err := EncryptWithKey(plaintext, key)
	if err != nil {
		return "", err
	}

	encFileName := baseName + EncryptedPdfExt
	fullPath := filepath.Join(SuratUploadDir, encFileName)
	if err := os.WriteFile(fullPath, ciphertext, 0o644); err != nil {
		return "", err
	}

	return filepath.Join("surat", encFileName), nil
}

// DeleteGeneratedFile menghapus file surat hasil generate (di uploads/surat)
func DeleteGeneratedFile(relPath string) error {
	if relPath == "" {
		return nil
	}
	fullPath := filepath.Join(SuratUploadDir, filepath.Base(relPath))
	if err := os.Remove(fullPath); err != nil && !errors.Is(err, os.ErrNotExist) {
		return err
	}
	return nil
}

// SaveBeritaImage menyimpan foto berita (konten publik) sebagai file polos di
// uploads/berita tanpa enkripsi. Mengembalikan path relatif (misal berita/123_foto.jpg).
func SaveBeritaImage(content []byte, originalFilename string) (string, error) {
	if strings.TrimSpace(originalFilename) == "" {
		return "", errors.New("nama file foto tidak boleh kosong")
	}
	ext := strings.ToLower(filepath.Ext(originalFilename))
	if ext == "" {
		ext = ".jpg"
	}
	baseName := buildArchiveFileName(originalFilename)

	if err := EnsureDir(BeritaUploadDir); err != nil {
		return "", err
	}

	fileName := baseName + ext
	fullPath := filepath.Join(BeritaUploadDir, fileName)
	if err := os.WriteFile(fullPath, content, 0o644); err != nil {
		return "", err
	}

	return filepath.Join("berita", fileName), nil
}

// DeleteBeritaImage menghapus file foto berita
func DeleteBeritaImage(relPath string) error {
	if relPath == "" {
		return nil
	}
	fullPath := filepath.Join(BeritaUploadDir, filepath.Base(relPath))
	if err := os.Remove(fullPath); err != nil && !errors.Is(err, os.ErrNotExist) {
		return err
	}
	return nil
}

// SaveMediaFile menyimpan file media (galeri publik, konten polos) di
// uploads/media tanpa enkripsi. Mengembalikan path relatif (misal media/123_file.mp4).
func SaveMediaFile(content []byte, originalFilename string) (string, error) {
	if strings.TrimSpace(originalFilename) == "" {
		return "", errors.New("nama file media tidak boleh kosong")
	}
	ext := strings.ToLower(filepath.Ext(originalFilename))
	if ext == "" {
		ext = ".jpg"
	}
	baseName := buildArchiveFileName(originalFilename)

	if err := EnsureDir(MediaUploadDir); err != nil {
		return "", err
	}

	fileName := baseName + ext
	fullPath := filepath.Join(MediaUploadDir, fileName)
	if err := os.WriteFile(fullPath, content, 0o644); err != nil {
		return "", err
	}

	return filepath.Join("media", fileName), nil
}

// DeleteMediaFile menghapus file media galeri
func DeleteMediaFile(relPath string) error {
	if relPath == "" {
		return nil
	}
	fullPath := filepath.Join(MediaUploadDir, filepath.Base(relPath))
	if err := os.Remove(fullPath); err != nil && !errors.Is(err, os.ErrNotExist) {
		return err
	}
	return nil
}

// SaveAparaturPhoto menyimpan foto aparatur (konten publik) sebagai file polos di
// uploads/aparatur. Mengembalikan path relatif (misal aparatur/123_kades.jpg).
func SaveAparaturPhoto(content []byte, originalFilename string) (string, error) {
	if strings.TrimSpace(originalFilename) == "" {
		return "", errors.New("nama file foto tidak boleh kosong")
	}
	ext := strings.ToLower(filepath.Ext(originalFilename))
	if ext == "" {
		ext = ".jpg"
	}
	baseName := buildArchiveFileName(originalFilename)

	if err := EnsureDir(AparaturUploadDir); err != nil {
		return "", err
	}

	fileName := baseName + ext
	fullPath := filepath.Join(AparaturUploadDir, fileName)
	if err := os.WriteFile(fullPath, content, 0o644); err != nil {
		return "", err
	}

	return filepath.Join("aparatur", fileName), nil
}

// DeleteAparaturPhoto menghapus file foto aparatur
func DeleteAparaturPhoto(relPath string) error {
	if relPath == "" {
		return nil
	}
	fullPath := filepath.Join(AparaturUploadDir, filepath.Base(relPath))
	if err := os.Remove(fullPath); err != nil && !errors.Is(err, os.ErrNotExist) {
		return err
	}
	return nil
}
