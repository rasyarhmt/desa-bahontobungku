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

var relationshipIDPattern = regexp.MustCompile(`Id="([^"]+)"`)

// InsertQRCodeDOCX menyisipkan QR ke DOCX tepat setelah paragraf terakhir
// pada body, yaitu blok tanda tangan / nama kepala desa.
func InsertQRCodeDOCX(docxBytes []byte, pngBytes []byte) ([]byte, error) {
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

	entries := make(map[string][]byte)
	order := make([]string, 0, len(zr.File))

	for _, f := range zr.File {
		rc, err := f.Open()
		if err != nil {
			return nil, fmt.Errorf("gagal membuka %s: %w", f.Name, err)
		}
		data, err := io.ReadAll(rc)
		rc.Close()
		if err != nil {
			return nil, fmt.Errorf("gagal membaca %s: %w", f.Name, err)
		}
		entries[f.Name] = data
		order = append(order, f.Name)
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

	mediaName := "word/media/qr_verifikasi.png"
	for i := 1; ; i++ {
		if _, exists := entries[mediaName]; !exists {
			break
		}
		mediaName = fmt.Sprintf("word/media/qr_verifikasi_%d.png", i)
	}
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

	qrParagraph := buildQRParagraph(relID, 3*emuPerCM)
	offset := qrInsertionOffset(doc)

	newDoc := make([]byte, 0, len(doc)+len(qrParagraph))
	newDoc = append(newDoc, doc[:offset]...)
	newDoc = append(newDoc, qrParagraph...)
	newDoc = append(newDoc, doc[offset:]...)

	entries["word/document.xml"] = newDoc
	entries[mediaName] = pngBytes

	return rebuildZip(order, entries)
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
			`</w:drawing></w:r>`+
			`</w:p>`,
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
