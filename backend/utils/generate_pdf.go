package utils

import (
	"fmt"
	"strings"
)

func GeneratePDFWithQR(
	templateBytes []byte,
	data map[string]string,
	qrPNG []byte,
) ([]byte, error) {
	boundDOCX, err := BindDOCX(templateBytes, data)
	if err != nil {
		return nil, err
	}

	remaining, err := ExtractDOCXPlaceholders(boundDOCX)
	if err != nil {
		return nil, err
	}
	if len(remaining) > 0 {
		return nil, fmt.Errorf("placeholder belum terisi: %s", strings.Join(remaining, ", "))
	}

	if len(qrPNG) > 0 {
		boundDOCX, err = InsertQRCodeDOCX(boundDOCX, qrPNG)
		if err != nil {
			return nil, err
		}
	}

	pdfBytes, err := DOCXToPDF(boundDOCX)
	if err != nil {
		return nil, err
	}

	return pdfBytes, nil
}
