package utils

import (
	"fmt"
	"strings"
)

const qrPlaceholderMarker = "DESA_QR_PLACEHOLDER_4F8C2E1A"

func GeneratePDFWithQR(
	templateBytes []byte,
	data map[string]string,
	qrPNG []byte,
) ([]byte, error) {
	bindData := make(map[string]string, len(data)+1)
	for key, value := range data {
		bindData[key] = value
	}
	bindData["qr"] = qrPlaceholderMarker

	boundDOCX, err := BindDOCX(templateBytes, bindData)
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
		boundDOCX, err = InsertQRCodeDOCXAtPlaceholder(boundDOCX, qrPNG, qrPlaceholderMarker)
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
