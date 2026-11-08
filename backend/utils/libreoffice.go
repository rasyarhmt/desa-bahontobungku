package utils

import (
	"errors"
	"os/exec"
)

// findLibreOffice mencari binary LibreOffice di PATH.
func findLibreOffice() (string, error) {
	for _, name := range []string{"libreoffice", "soffice"} {
		path, err := exec.LookPath(name)
		if err == nil {
			return path, nil
		}
	}

	return "", errors.New("libreoffice tidak ditemukan di PATH")
}
