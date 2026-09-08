package utils

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

const loBinaries = "libreoffice"

// findLibreOffice mencari binary libreoffice/soffice di PATH.
func findLibreOffice() (string, error) {
	for _, name := range []string{"libreoffice", "soffice"} {
		if p, err := exec.LookPath(name); err == nil {
			return p, nil
		}
	}
	return "", errors.New("libreoffice tidak ditemukan di PATH")
}

// HTMLToPDF mengonversi konten HTML menjadi PDF memakai LibreOffice headless.
// Mengembalikan byte PDF. File sementara (HTML & PDF) dibersihkan otomatis.
func HTMLToPDF(htmlContent []byte) ([]byte, error) {
	if len(htmlContent) == 0 {
		return nil, errors.New("konten HTML kosong")
	}

	bin, err := findLibreOffice()
	if err != nil {
		return nil, err
	}

	tmpDir, err := os.MkdirTemp("", "desa-surat-*")
	if err != nil {
		return nil, err
	}
	defer os.RemoveAll(tmpDir)

	inputPath := filepath.Join(tmpDir, "surat.html")
	if err := os.WriteFile(inputPath, htmlContent, 0o644); err != nil {
		return nil, err
	}

	outputDir := filepath.Join(tmpDir, "out")
	if err := os.MkdirAll(outputDir, 0o755); err != nil {
		return nil, err
	}

	profileDir := filepath.Join(tmpDir, "lo_profile")

	cmd := exec.Command(
		bin,
		"--headless",
		"-env:UserInstallation=file://"+profileDir,
		"--convert-to", "pdf:writer_pdf_Export",
		"--outdir", outputDir,
		inputPath,
	)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("konversi PDF gagal: %w, detail: %s", err, string(output))
	}

	pdfPath := filepath.Join(outputDir, "surat.pdf")
	pdfBytes, err := os.ReadFile(pdfPath)
	if err != nil {
		return nil, fmt.Errorf("hasil PDF tidak ditemukan: %w", err)
	}
	return pdfBytes, nil
}
