package utils

import (
	"bytes"
	"encoding/xml"
	"fmt"
	"html"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"unicode/utf8"

	"github.com/nguyenthenguyen/docx"
)

var (
	docxPlaceholderPattern = regexp.MustCompile(`\{\{\s*([^}]+?)\s*\}\}`)
	docxTextNodePattern    = regexp.MustCompile(`<w:t(?:\s[^>]*)?>([^<]*)</w:t>`)
	docxEntityPattern      = regexp.MustCompile(`&(?:#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);`)
)

type docxFlatText struct {
	text   string
	starts []int
	ends   []int
}

func flattenDOCXText(content string) docxFlatText {
	var text strings.Builder
	flat := docxFlatText{}
	for _, loc := range docxTextNodePattern.FindAllStringSubmatchIndex(content, -1) {
		innerStart, innerEnd := loc[2], loc[3]
		encoded := content[innerStart:innerEnd]
		for pos := 0; pos < len(encoded); {
			size := 0
			if entity := docxEntityPattern.FindStringIndex(encoded[pos:]); entity != nil && entity[0] == 0 {
				size = entity[1]
			} else {
				_, runeSize := utf8.DecodeRuneInString(encoded[pos:])
				if runeSize == 0 {
					runeSize = 1
				}
				size = runeSize
			}
			decoded := html.UnescapeString(encoded[pos : pos+size])
			for i := 0; i < len(decoded); i++ {
				flat.starts = append(flat.starts, innerStart+pos)
				flat.ends = append(flat.ends, innerStart+pos+size)
			}
			text.WriteString(decoded)
			pos += size
		}
	}
	flat.text = text.String()
	return flat
}

func placeholderKeyValues(data map[string]string) map[string]string {
	values := make(map[string]string, len(data))
	for key, value := range data {
		key = strings.TrimSpace(key)
		if key == "" {
			continue
		}
		if strings.HasPrefix(key, "{{") && strings.HasSuffix(key, "}}") {
			key = strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(key, "{{"), "}}"))
		}
		if key == "" {
			continue
		}
		values[key] = value
	}
	return values
}

func replaceDOCXPlaceholders(content string, data map[string]string) (string, error) {
	flat := flattenDOCXText(content)
	values := placeholderKeyValues(data)

	type replacement struct {
		start int
		end   int
		value string
	}
	replacements := make([]replacement, 0)
	for _, loc := range docxPlaceholderPattern.FindAllStringSubmatchIndex(flat.text, -1) {
		key := strings.TrimSpace(flat.text[loc[2]:loc[3]])
		value, ok := values[key]
		if !ok || loc[0] >= len(flat.starts) || loc[1] == 0 || loc[1]-1 >= len(flat.ends) {
			continue
		}
		replacements = append(replacements, replacement{
			start: flat.starts[loc[0]],
			end:   flat.ends[loc[1]-1],
			value: value,
		})
	}

	for i := len(replacements) - 1; i >= 0; i-- {
		r := replacements[i]
		var escaped strings.Builder
		if err := xml.EscapeText(&escaped, []byte(r.value)); err != nil {
			return "", err
		}
		value := escaped.String()
		value = strings.ReplaceAll(value, "&#xD;&#xA;", docx.NEWLINE)
		value = strings.ReplaceAll(value, "&#xD;", docx.NEWLINE)
		value = strings.ReplaceAll(value, "&#xA;", docx.NEWLINE)
		value = strings.ReplaceAll(value, "&#x9;", docx.TAB)
		content = content[:r.start] + value + content[r.end:]
	}
	return content, nil
}

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

	flat := flattenDOCXText(reader.Editable().GetContent())

	seen := make(map[string]bool)
	fields := make([]string, 0)
	for _, m := range docxPlaceholderPattern.FindAllStringSubmatch(flat.text, -1) {
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
	content, err := replaceDOCXPlaceholders(document.GetContent(), data)
	if err != nil {
		return nil, fmt.Errorf("gagal mengganti placeholder: %w", err)
	}
	document.SetContent(content)

	if err := document.WriteToFile(outputPath); err != nil {
		return nil, fmt.Errorf("gagal menyimpan DOCX hasil binding: %w", err)
	}

	result, err := os.ReadFile(outputPath)
	if err != nil {
		return nil, fmt.Errorf("gagal membaca DOCX hasil binding: %w", err)
	}

	return result, nil
}
