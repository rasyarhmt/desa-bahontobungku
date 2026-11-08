package utils

import (
	"bytes"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/nguyenthenguyen/docx"
)

// docxPlaceholderPattern mencocokkan {{ key }} pada dokumen DOCX.
var docxPlaceholderPattern = regexp.MustCompile(`\{\{\s*([^}]+?)\s*\}\}`)

// ExtractDOCXPlaceholders mengembalikan daftar key placeholder {{ key }} yang
// ditemukan di bagian dokumen utama template DOCX. Urutan sesuai kemunculan
// dan tanpa duplikat.
func ExtractDOCXPlaceholders(templateBytes []byte) ([]string, error) {
	if len(templateBytes) == 0 {
		return nil, fmt.Errorf("template DOCX kosong")
	}

	reader, err := docx.ReadDocxFromMemory(
		bytes.NewReader(templateBytes),
		int64(len(templateBytes)),
	)
	if err != nil {
		return nil, fmt.Errorf("gagal membaca template DOCX: %w", err)
	}
	defer reader.Close()

	content := reader.Editable().GetContent()

	seen := make(map[string]bool)
	fields := make([]string, 0)
	for _, m := range docxPlaceholderPattern.FindAllStringSubmatch(content, -1) {
		if len(m) != 2 {
			continue
		}
		key := strings.TrimSpace(m[1])
		if key == "" || seen[key] {
			continue
		}
		seen[key] = true
		fields = append(fields, key)
	}

	return fields, nil
}

// BindDOCX mengganti placeholder dalam template DOCX.
func BindDOCX(
	templateBytes []byte,
	data map[string]string,
) ([]byte, error) {
	if len(templateBytes) == 0 {
		return nil, fmt.Errorf("template DOCX kosong")
	}

	tmpDir, err := os.MkdirTemp("", "desa-docx-*")
	if err != nil {
		return nil, fmt.Errorf("gagal membuat direktori sementara: %w", err)
	}
	defer os.RemoveAll(tmpDir)

	templatePath := filepath.Join(tmpDir, "template.docx")
	outputPath := filepath.Join(tmpDir, "hasil.docx")

	if err := os.WriteFile(templatePath, templateBytes, 0600); err != nil {
		return nil, fmt.Errorf("gagal menyimpan template: %w", err)
	}

	reader, err := docx.ReadDocxFile(templatePath)
	if err != nil {
		return nil, fmt.Errorf("gagal membaca template DOCX: %w", err)
	}
	defer reader.Close()

	document := reader.Editable()

	for key, value := range data {
		if strings.TrimSpace(key) == "" {
			continue
		}

		// Jika caller sudah mengirim token lengkap ({{ key }}), pakai apa adanya.
		// Jika hanya nama key polos, bentuk menjadi token placeholder termasuk
		// variasi spasi agar tetap cocok.
		tokens := []string{key}
		if !strings.Contains(key, "{{") {
			tokens = []string{
				"{{" + key + "}}",
				"{{ " + key + " }}",
				"{{" + key + " }}",
				"{{ " + key + "}}",
			}
		}

		for _, token := range tokens {
			if err := document.Replace(token, value, -1); err != nil {
				return nil, fmt.Errorf("gagal mengganti placeholder %q: %w", token, err)
			}
		}
	}

	if err := document.WriteToFile(outputPath); err != nil {
		return nil, fmt.Errorf("gagal menyimpan DOCX hasil binding: %w", err)
	}

	result, err := os.ReadFile(outputPath)
	if err != nil {
		return nil, fmt.Errorf("gagal membaca DOCX hasil binding: %w", err)
	}

	return result, nil
}
