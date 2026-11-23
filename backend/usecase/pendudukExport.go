package usecase

import (
	"bytes"
	"context"
	"fmt"
	"strings"
	"unicode"

	"github.com/xuri/excelize/v2"
)

func (u *pendudukUsecase) ExportXLSX(ctx context.Context) ([]byte, error) {
	list, err := u.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	file := excelize.NewFile()
	defer file.Close()

	const sheet = "Penduduk"
	if err := file.SetSheetName("Sheet1", sheet); err != nil {
		return nil, err
	}

	headers := []string{
		"No",
		"NIK",
		"Nama",
		"Alamat",
		"Tempat Lahir",
		"Tanggal Lahir",
		"Jenis Kelamin",
		"Agama",
		"Pekerjaan",
		"Nomor KK",
		"Status",
		"Nama Kepala Keluarga",
	}
	widths := []float64{6, 20, 28, 36, 18, 16, 16, 14, 20, 20, 18, 26}

	headerStyle, err := file.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "#FFFFFF"},
		Fill:      excelize.Fill{Type: "pattern", Pattern: 1, Color: []string{"#1D4ED8"}},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
	})
	if err != nil {
		return nil, err
	}
	textStyle, err := file.NewStyle(&excelize.Style{NumFmt: 49})
	if err != nil {
		return nil, err
	}

	for i, header := range headers {
		cell, err := excelize.ColumnNumberToName(i + 1)
		if err != nil {
			return nil, err
		}
		if err := file.SetCellValue(sheet, cell+"1", header); err != nil {
			return nil, err
		}
		if err := file.SetColWidth(sheet, cell, cell, widths[i]); err != nil {
			return nil, err
		}
	}
	lastColumn, err := excelize.ColumnNumberToName(len(headers))
	if err != nil {
		return nil, err
	}
	if err := file.SetCellStyle(sheet, "A1", lastColumn+"1", headerStyle); err != nil {
		return nil, err
	}
	if err := file.SetRowHeight(sheet, 1, 26); err != nil {
		return nil, err
	}

	for i, p := range list {
		row := i + 2
		values := []any{
			i + 1,
			p.NIK,
			p.Nama,
			p.Alamat,
			p.TempatLahir,
			p.TanggalLahir,
			exportTitleCase(p.JenisKelamin),
			exportTitleCase(p.Agama),
			p.Pekerjaan,
			p.NomorKK,
			exportTitleCase(p.StatusNama),
			p.NamaKepalakeluarga,
		}
		for j, value := range values {
			column, err := excelize.ColumnNumberToName(j + 1)
			if err != nil {
				return nil, err
			}
			if err := file.SetCellValue(sheet, fmt.Sprintf("%s%d", column, row), value); err != nil {
				return nil, err
			}
		}
	}

	if len(list) > 0 {
		lastRow := len(list) + 1
		if err := file.SetCellStyle(sheet, "B2", fmt.Sprintf("B%d", lastRow), textStyle); err != nil {
			return nil, err
		}
		if err := file.SetCellStyle(sheet, "J2", fmt.Sprintf("J%d", lastRow), textStyle); err != nil {
			return nil, err
		}
		if err := file.AutoFilter(sheet, fmt.Sprintf("A1:%s%d", lastColumn, lastRow), nil); err != nil {
			return nil, err
		}
	}

	var buf bytes.Buffer
	if err := file.Write(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func exportTitleCase(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return ""
	}
	runes := []rune(value)
	runes[0] = unicode.ToUpper(runes[0])
	return string(runes)
}
