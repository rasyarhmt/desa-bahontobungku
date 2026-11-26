package utils

import (
	"archive/zip"
	"bytes"
	"errors"
	"fmt"
	"io"
	"regexp"
	"strings"
)

const emuPerCM = 360000

const qrSizeEMU = 3 * emuPerCM

var (
	relationshipIDPattern = regexp.MustCompile(`Id="([^"]+)"`)
	qrRunStartPattern     = regexp.MustCompile(`<w:r(?:\s[^>]*)?>`)
)

// InsertQRCodeDOCX menyisipkan QR ke DOCX tepat setelah paragraf terakhir
// pada body, yaitu blok tanda tangan / nama kepala desa.
func InsertQRCodeDOCX(docxBytes []byte, pngBytes []byte) ([]byte, error) {
	return insertQRCodeDOCX(docxBytes, pngBytes, "")
}

func InsertQRCodeDOCXAtPlaceholder(docxBytes []byte, pngBytes []byte, marker string) ([]byte, error) {
	return insertQRCodeDOCX(docxBytes, pngBytes, marker)
}

func insertQRCodeDOCX(docxBytes []byte, pngBytes []byte, marker string) ([]byte, error) {
	if len(docxBytes) == 0 {
		return nil, errors.New("konten DOCX kosong")
	}
	if len(pngBytes) == 0 {
		return nil, errors.New("gambar QR kosong")
	}

	zr, err := zip.NewReader(bytes.NewReader(docxBytes), int64(len(docxBytes)))
	if err != nil {
		return nil, fmt.Errorf("gagal membaca DOCX: %w", err)
	}

	entries, order, err := readDOCXEntries(zr)
	if err != nil {
		return nil, err
	}

	doc, ok := entries["word/document.xml"]
	if !ok {
		return nil, errors.New("word/document.xml tidak ditemukan")
	}

	relsName := "word/_rels/document.xml.rels"
	rels, ok := entries[relsName]
	if !ok {
		return nil, errors.New(relsName + " tidak ditemukan")
	}

	relID := nextRelationshipID(rels)
	mediaName := nextQRMediaName(entries)
	target := strings.TrimPrefix(mediaName, "word/")

	relEntry := fmt.Sprintf(
		`<Relationship Id="%s" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="%s"/>`,
		relID,
		target,
	)
	rels = insertBeforeClosing(rels, "</Relationships>", relEntry)
	entries[relsName] = rels

	contentTypes, ok := entries["[Content_Types].xml"]
	if !ok {
		return nil, errors.New("[Content_Types].xml tidak ditemukan")
	}
	if !bytes.Contains(contentTypes, []byte(`Extension="png"`)) {
		contentTypes = insertBeforeClosing(
			contentTypes,
			"</Types>",
			`<Default Extension="png" ContentType="image/png"/>`,
		)
		entries["[Content_Types].xml"] = contentTypes
	}

	drawingRun := buildQRRun(relID, qrSizeEMU)
	if marker != "" {
		if replaced, ok := replaceQRMarker(doc, marker, drawingRun); ok {
			doc = replaced
		} else {
			doc = appendQRParagraph(doc, buildQRParagraph(relID, qrSizeEMU))
		}
	} else {
		doc = appendQRParagraph(doc, buildQRParagraph(relID, qrSizeEMU))
	}

	entries["word/document.xml"] = doc
	entries[mediaName] = pngBytes

	return rebuildZip(order, entries)
}

func readDOCXEntries(zr *zip.Reader) (map[string][]byte, []string, error) {
	entries := make(map[string][]byte, len(zr.File))
	order := make([]string, 0, len(zr.File))

	for _, f := range zr.File {
		rc, err := f.Open()
		if err != nil {
			return nil, nil, fmt.Errorf("gagal membuka %s: %w", f.Name, err)
		}
		data, err := io.ReadAll(rc)
		rc.Close()
		if err != nil {
			return nil, nil, fmt.Errorf("gagal membaca %s: %w", f.Name, err)
		}
		entries[f.Name] = data
		order = append(order, f.Name)
	}
	return entries, order, nil
}

func nextQRMediaName(entries map[string][]byte) string {
	mediaName := "word/media/qr_verifikasi.png"
	for i := 1; ; i++ {
		if _, exists := entries[mediaName]; !exists {
			return mediaName
		}
		mediaName = fmt.Sprintf("word/media/qr_verifikasi_%d.png", i)
	}
}

func replaceQRMarker(doc []byte, marker string, drawingRun string) ([]byte, bool) {
	markerStart := bytes.Index(doc, []byte(marker))
	if markerStart < 0 {
		return doc, false
	}
	markerEnd := markerStart + len(marker)

	if _, _, ok := textNodeRangeContaining(string(doc), markerStart, markerEnd); !ok {
		return doc, false
	}

	runStart := 0
	for _, m := range qrRunStartPattern.FindAllStringSubmatchIndex(string(doc), -1) {
		if m[1] > markerStart {
			break
		}
		runStart = m[0]
	}
	if runStart >= markerStart {
		return doc, false
	}

	runEndOffset := bytes.Index(doc[markerStart:], []byte("</w:r>"))
	if runEndOffset < 0 {
		return doc, false
	}
	runEnd := markerStart + runEndOffset + len("</w:r>")

	withDrawing := make([]byte, 0, len(doc)+len(drawingRun))
	withDrawing = append(withDrawing, doc[:runEnd]...)
	withDrawing = append(withDrawing, []byte(drawingRun)...)
	withDrawing = append(withDrawing, doc[runEnd:]...)

	result := make([]byte, 0, len(withDrawing)-len(marker))
	result = append(result, withDrawing[:markerStart]...)
	result = append(result, withDrawing[markerEnd:]...)
	return result, true
}

func textNodeRangeContaining(content string, start, end int) (int, int, bool) {
	for _, loc := range docxTextNodePattern.FindAllStringSubmatchIndex(content, -1) {
		if loc[2] <= start && end <= loc[3] {
			return loc[2], loc[3], true
		}
	}
	return 0, 0, false
}

func nextRelationshipID(rels []byte) string {
	used := make(map[string]bool)
	for _, m := range relationshipIDPattern.FindAllSubmatch(rels, -1) {
		if len(m) == 2 {
			used[string(m[1])] = true
		}
	}

	base := "rIdQRCode"
	if !used[base] {
		return base
	}
	for i := 1; ; i++ {
		id := fmt.Sprintf("rIdQRCode%d", i)
		if !used[id] {
			return id
		}
	}
}

func appendQRParagraph(doc []byte, paragraph string) []byte {
	offset := qrInsertionOffset(doc)

	newDoc := make([]byte, 0, len(doc)+len(paragraph))
	newDoc = append(newDoc, doc[:offset]...)
	newDoc = append(newDoc, []byte(paragraph)...)
	newDoc = append(newDoc, doc[offset:]...)
	return newDoc
}

func qrInsertionOffset(doc []byte) int {
	bodyEnd := bytes.LastIndex(doc, []byte("</w:body>"))
	if bodyEnd < 0 {
		bodyEnd = len(doc)
	}

	limit := bodyEnd
	if sectPr := bytes.LastIndex(doc[:bodyEnd], []byte("<w:sectPr")); sectPr >= 0 {
		limit = sectPr
	}

	if pEnd := bytes.LastIndex(doc[:limit], []byte("</w:p>")); pEnd >= 0 {
		return pEnd + len("</w:p>")
	}
	return limit
}

func buildQRParagraph(relID string, sizeEMU int) string {
	return fmt.Sprintf(
		`<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">`+
			`<w:pPr>`+
			`<w:pStyle w:val="Normal"/>`+
			`<w:spacing w:lineRule="auto" w:line="240" w:before="80" w:after="0"/>`+
			`<w:ind w:start="5245"/>`+
			`<w:jc w:val="end"/>`+
			`</w:pPr>`+
			`%s`+
			`</w:p>`,
		buildQRRun(relID, sizeEMU),
	)
}

func buildQRRun(relID string, sizeEMU int) string {
	return fmt.Sprintf(
		`<w:r><w:drawing>`+
			`<wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" distT="0" distB="0" distL="0" distR="0">`+
			`<wp:extent cx="%d" cy="%d"/>`+
			`<wp:effectExtent l="0" t="0" r="0" b="0"/>`+
			`<wp:docPr id="9001" name="QR Verifikasi Surat" descr="QR verifikasi keaslian surat"/>`+
			`<wp:cNvGraphicFramePr>`+
			`<a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>`+
			`</wp:cNvGraphicFramePr>`+
			`<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">`+
			`<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">`+
			`<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">`+
			`<pic:nvPicPr><pic:cNvPr id="9001" name="qr_verifikasi.png"/><pic:cNvPicPr/></pic:nvPicPr>`+
			`<pic:blipFill><a:blip r:embed="%s"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>`+
			`<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="%d" cy="%d"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>`+
			`</pic:pic>`+
			`</a:graphicData>`+
			`</a:graphic>`+
			`</wp:inline>`+
			`</w:drawing></w:r>`,
		sizeEMU,
		sizeEMU,
		relID,
		sizeEMU,
		sizeEMU,
	)
}

func insertBeforeClosing(src []byte, closing, entry string) []byte {
	idx := bytes.LastIndex(src, []byte(closing))
	if idx < 0 {
		return src
	}

	out := make([]byte, 0, len(src)+len(entry))
	out = append(out, src[:idx]...)
	out = append(out, []byte(entry)...)
	out = append(out, src[idx:]...)
	return out
}

func rebuildZip(order []string, entries map[string][]byte) ([]byte, error) {
	var buf bytes.Buffer
	zw := zip.NewWriter(&buf)
	seen := make(map[string]bool, len(entries))

	write := func(name string) error {
		w, err := zw.Create(name)
		if err != nil {
			return err
		}
		_, err = w.Write(entries[name])
		return err
	}

	for _, name := range order {
		if seen[name] {
			continue
		}
		seen[name] = true
		if err := write(name); err != nil {
			return nil, err
		}
	}

	for name := range entries {
		if seen[name] {
			continue
		}
		seen[name] = true
		if err := write(name); err != nil {
			return nil, err
		}
	}

	if err := zw.Close(); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
