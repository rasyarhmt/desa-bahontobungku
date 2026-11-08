package usecase

import (
	"fmt"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
)

const (
	maxAparaturFotoSize = 5 << 20  // 5 MB
	maxBeritaFotoSize   = 5 << 20  // 5 MB
	maxMediaFileSize    = 50 << 20 // 50 MB
	maxSuratFileSize    = 10 << 20 // 10 MB
	maxTemplateFileSize = 5 << 20  // 5 MB
)

var aparaturImageExt = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".webp": true,
}

var beritaImageExt = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".webp": true,
	".gif":  true,
}

var mediaAllowedTypes = map[string][]string{
	domain.MediaTipeFoto:    {"image/jpeg", "image/png"},
	domain.MediaTipeVideo:   {"video/mp4", "video/mkv", "video/webm"},
	domain.MediaTipeDokumen: {"application/pdf"},
}

func validateMediaMimeType(tipe, mimetype string) bool {
	allowed, ok := mediaAllowedTypes[tipe]
	if !ok {
		return false
	}
	for _, a := range allowed {
		if strings.EqualFold(a, mimetype) {
			return true
		}
	}
	return false
}

func internalError(message string, err error) error {
	return domain.NewInternal(message, err)
}

// storeAparaturPhoto menyimpan foto aparatur (opsional) dan mengembalikan path
// relatif. UploadedFile nil berarti tidak ada file yang diunggah.
func storeAparaturPhoto(fh *UploadedFile) (string, error) {
	if fh == nil {
		return "", nil
	}
	if fh.Size > maxAparaturFotoSize {
		return "", domain.NewValidation("Ukuran foto melebihi batas maksimal 5 MB")
	}
	if !aparaturImageExt[strings.ToLower(filepath.Ext(fh.Filename))] {
		return "", domain.NewValidation("Format foto tidak didukung (jpg/jpeg/png/webp)")
	}
	relPath, err := utils.SaveAparaturPhoto(fh.Content, fh.Filename)
	if err != nil {
		return "", internalError("Gagal menyimpan foto aparatur", err)
	}
	return relPath, nil
}

func storeBeritaPhoto(fh *UploadedFile) (string, error) {
	if fh == nil {
		return "", nil
	}
	if fh.Size > maxBeritaFotoSize {
		return "", domain.NewValidation("Ukuran foto melebihi batas maksimal 5 MB")
	}
	if !beritaImageExt[strings.ToLower(filepath.Ext(fh.Filename))] {
		return "", domain.NewValidation("Format foto tidak didukung (jpg/jpeg/png/webp/gif)")
	}
	relPath, err := utils.SaveBeritaImage(fh.Content, fh.Filename)
	if err != nil {
		return "", internalError("Gagal menyimpan foto berita", err)
	}
	return relPath, nil
}

// storeMediaFile menyimpan file media utama beserta validasi MIME.
func storeMediaFile(fh *UploadedFile, tipe string) (string, error) {
	if fh.Size > maxMediaFileSize {
		return "", domain.NewValidation("Ukuran file melebihi batas maksimal 50 MB")
	}
	if !validateMediaMimeType(tipe, fh.ContentType) {
		return "", domain.NewValidation("Format file tidak didukung untuk tipe " + tipe)
	}
	return saveMediaFile(fh)
}

// storeMediaFileUpdate menyimpan file media pengganti tanpa validasi MIME,
// sesuai perilaku endpoint update.
func storeMediaFileUpdate(fh *UploadedFile) (string, error) {
	if fh == nil {
		return "", nil
	}
	if fh.Size > maxMediaFileSize {
		return "", domain.NewValidation("Ukuran file melebihi batas maksimal 50 MB")
	}
	return saveMediaFile(fh)
}

func saveMediaFile(fh *UploadedFile) (string, error) {
	relPath, err := utils.SaveMediaFile(fh.Content, fh.Filename)
	if err != nil {
		return "", internalError("Gagal menyimpan file media", err)
	}
	return relPath, nil
}

// storeMediaThumbnail menyimpan thumbnail media (opsional).
func storeMediaThumbnail(fh *UploadedFile) (string, error) {
	if fh == nil {
		return "", nil
	}
	if fh.Size > maxMediaFileSize {
		return "", domain.NewValidation("Ukuran thumbnail melebihi batas maksimal 50 MB")
	}
	relPath, err := utils.SaveMediaFile(fh.Content, fh.Filename)
	if err != nil {
		return "", internalError("Gagal menyimpan thumbnail", err)
	}
	return relPath, nil
}

// storeSuratArchive mengenkripsi dan menyimpan file arsip surat. Jika required
// false dan tidak ada file, path kosong dikembalikan.
func storeSuratArchive(fh *UploadedFile, required bool) (string, error) {
	if fh == nil {
		if required {
			return "", domain.NewValidation("File arsip wajib diupload")
		}
		return "", nil
	}
	if fh.Size > maxSuratFileSize {
		return "", domain.NewValidation("Ukuran file melebihi batas maksimal 10 MB")
	}
	relPath, err := utils.EncryptArchiveFile(fh.Content, fh.Filename)
	if err != nil {
		return "", internalError("Gagal menyimpan file arsip terenkripsi", err)
	}
	return relPath, nil
}

// storeTemplate mengenkripsi dan menyimpan file template DOCX. Jika required
// false dan tidak ada file, path kosong dikembalikan.
func storeTemplate(fh *UploadedFile, required bool) (string, error) {
	if fh == nil {
		if required {
			return "", domain.NewValidation("File template wajib diupload")
		}
		return "", nil
	}
	if fh.Size > maxTemplateFileSize {
		return "", domain.NewValidation("Ukuran file template melebihi batas maksimal 5 MB")
	}
	if !strings.EqualFold(filepath.Ext(fh.Filename), ".docx") {
		return "", domain.NewValidation("File template harus berformat .docx")
	}

	relPath, err := utils.EncryptFileContent(fh.Content, buildTemplateFileName(fh.Filename))
	if err != nil {
		return "", internalError("Gagal menyimpan file template terenkripsi", err)
	}
	return relPath, nil
}

// buildTemplateFileName menghasilkan nama unik dengan mempertahankan nama asli
// file yang diupload, diprefix timestamp Unix: <unix>_<originalName>
func buildTemplateFileName(originalFilename string) string {
	base := filepath.Base(originalFilename)
	noExt := strings.TrimSuffix(base, filepath.Ext(base))
	noExt = strings.ReplaceAll(noExt, " ", "_")
	noExt = strings.ReplaceAll(noExt, "-", "_")
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	return fmt.Sprintf("%s_%s", timestamp, noExt)
}
