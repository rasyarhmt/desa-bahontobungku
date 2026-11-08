package utils

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

// DOCXToPDF mengonversi DOCX menjadi PDF menggunakan LibreOffice.
func DOCXToPDF(docxBytes []byte) ([]byte, error) {
	if len(docxBytes) == 0 {
		return nil, errors.New("konten DOCX kosong")
	}

	bin, err := findLibreOffice()
	if err != nil {
		return nil, err
	}

	tmpDir, err := os.MkdirTemp("", "desa-surat-*")
	if err != nil {
		return nil, fmt.Errorf("gagal membuat direktori sementara: %w", err)
	}
	defer os.RemoveAll(tmpDir)

	inputPath := filepath.Join(tmpDir, "surat.docx")
	outputDir := filepath.Join(tmpDir, "out")
	profileDir := filepath.Join(tmpDir, "lo_profile")

	if err := os.WriteFile(inputPath, docxBytes, 0600); err != nil {
		return nil, fmt.Errorf("gagal menyimpan DOCX: %w", err)
	}

	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return nil, fmt.Errorf("gagal membuat direktori output: %w", err)
	}

	cmd := exec.Command(
		bin,
		"--headless",
		"-env:UserInstallation="+
			"file://"+filepath.ToSlash(profileDir),
		"--convert-to",
		"pdf:writer_pdf_Export",
		"--outdir",
		outputDir,
		inputPath,
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf(
			"konversi DOCX ke PDF gagal: %w, detail: %s",
			err,
			string(output),
		)
	}

	pdfPath := filepath.Join(outputDir, "surat.pdf")

	pdfBytes, err := os.ReadFile(pdfPath)
	if err != nil {
		return nil, fmt.Errorf("hasil PDF tidak ditemukan: %w", err)
	}

	if len(pdfBytes) == 0 {
		return nil, errors.New("hasil PDF kosong")
	}

	return pdfBytes, nil
}
