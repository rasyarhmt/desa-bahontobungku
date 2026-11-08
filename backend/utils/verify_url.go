package utils

import (
	"fmt"
	"strings"
)

// PickFrontendOrigin memilih origin frontend untuk URL verifikasi QR:
// pakai origin dev jika request dari localhost, selain itu origin prod.
func PickFrontendOrigin(host string, allowedOrigins []string) string {
	dev := ""
	prod := ""

	for _, o := range allowedOrigins {
		o = strings.TrimSpace(o)
		if o == "" {
			continue
		}
		if strings.Contains(o, "localhost") || strings.Contains(o, "127.0.0.1") {
			dev = o
		} else {
			prod = o
		}
	}

	if strings.Contains(host, "localhost") || strings.Contains(host, "127.0.0.1") {
		return strings.TrimSuffix(dev, "/")
	}
	return strings.TrimSuffix(prod, "/")
}

// BuildVerificationURL membuat URL absolut yang ditanam di QR surat.
func BuildVerificationURL(kode, requestHost string, isTLS bool, allowedOrigins []string) string {
	kode = strings.TrimSpace(kode)

	if origin := PickFrontendOrigin(requestHost, allowedOrigins); origin != "" {
		return origin + "/verifikasi?kode=" + kode
	}

	proto := "http"
	if isTLS {
		proto = "https"
	}
	return fmt.Sprintf("%s://%s/api/v1/log-cetak-surat/verifikasi/%s", proto, requestHost, kode)
}
