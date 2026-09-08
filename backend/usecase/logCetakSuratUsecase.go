package usecase

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strings"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
)

type logCetakSuratUsecase struct {
	logRepo       domain.LogCetakSuratRepository
	templateRepo  domain.SuratTemplateRepository
	pelayananRepo domain.PelayananRepository
}

func NewLogCetakSuratUsecase(
	logRepo domain.LogCetakSuratRepository,
	templateRepo domain.SuratTemplateRepository,
	pelayananRepo domain.PelayananRepository,
) domain.LogCetakSuratUsecase {
	return &logCetakSuratUsecase{logRepo: logRepo, templateRepo: templateRepo, pelayananRepo: pelayananRepo}
}

var placeholderPattern = regexp.MustCompile(`\{\{\s*([^}]+?)\s*\}\}`)

func renderTemplateHTML(htmlContent []byte, data map[string]string) string {
	src := string(htmlContent)
	return placeholderPattern.ReplaceAllStringFunc(src, func(m string) string {
		sub := placeholderPattern.FindStringSubmatch(m)
		if len(sub) != 2 {
			return m
		}
		key := strings.TrimSpace(sub[1])
		if v, ok := data[key]; ok {
			return v
		}
		return m
	})
}

func (u *logCetakSuratUsecase) Ajukan(ctx context.Context, idPelayanan int, req dto.AjukanSuratRequestDTO) (*dto.AjukanSuratResponseDTO, error) {
	if idPelayanan <= 0 {
		return nil, errors.New("id_pelayanan tidak valid")
	}
	if strings.TrimSpace(req.NamaPemohon) == "" {
		return nil, errors.New("nama_pemohon wajib diisi")
	}
	if strings.TrimSpace(req.NikPemohon) == "" {
		return nil, errors.New("nik_pemohon wajib diisi")
	}

	p, err := u.pelayananRepo.GetByID(ctx, idPelayanan)
	if err != nil {
		return nil, err
	}
	if p == nil {
		return nil, errors.New("pelayanan tidak ditemukan")
	}
	if p.Status != domain.PelayananStatusAktif {
		return nil, errors.New("pelayanan tidak aktif")
	}
	if p.IDSuratTemplate == nil {
		return nil, errors.New("pelayanan ini belum memiliki template surat")
	}

	tpl, err := u.templateRepo.GetByID(ctx, *p.IDSuratTemplate)
	if err != nil {
		return nil, err
	}
	if tpl == nil {
		return nil, errors.New("template surat tidak ditemukan")
	}
	if tpl.Status != domain.TemplateStatusAktif {
		return nil, errors.New("template surat tidak aktif")
	}

	htmlBytes, err := utils.DecryptFileContent(tpl.FileTemplate)
	if err != nil {
		return nil, errors.New("gagal membaca template surat terenkripsi")
	}

	data := make(map[string]string, len(req.Data)+2)
	for k, v := range req.Data {
		switch val := v.(type) {
		case string:
			data[k] = val
		default:
			if b, errMarshal := json.Marshal(v); errMarshal == nil {
				data[k] = string(b)
			}
		}
	}
	data["nama_pemohon"] = strings.TrimSpace(req.NamaPemohon)
	data["nik_pemohon"] = strings.TrimSpace(req.NikPemohon)

	renderedHTML := renderTemplateHTML(htmlBytes, data)
	pdfBytes, err := utils.HTMLToPDF([]byte(renderedHTML))
	if err != nil {
		return nil, err
	}

	kode, err := u.generateUniqueCode(ctx)
	if err != nil {
		return nil, err
	}

	filePath, err := utils.EncryptSuratFile(pdfBytes, kode)
	if err != nil {
		return nil, errors.New("gagal menyimpan surat terenkripsi")
	}

	l := &domain.LogCetakSurat{
		KodeUnik:    kode,
		IDTemplate:  p.IDSuratTemplate,
		IDPelayanan: &idPelayanan,
		NamaPemohon: strings.TrimSpace(req.NamaPemohon),
		NikPemohon:  strings.TrimSpace(req.NikPemohon),
		File:        filePath,
		Status:      domain.LogCetakStatusDicetak,
	}

	id, err := u.logRepo.Create(ctx, l)
	if err != nil {
		_ = utils.DeleteGeneratedFile(filePath)
		return nil, err
	}
	l.ID = id

	return &dto.AjukanSuratResponseDTO{
		ID:          l.ID,
		KodeUnik:    l.KodeUnik,
		NamaPemohon: l.NamaPemohon,
		Status:      l.Status,
		FileURL:     fmt.Sprintf("/api/v1/log-cetak-surat/surat/%s/file", l.KodeUnik),
		QRURL:       fmt.Sprintf("/api/v1/log-cetak-surat/verifikasi/%s/qr", l.KodeUnik),
		CreatedAt:   l.CreatedAt,
	}, nil
}

func (u *logCetakSuratUsecase) generateUniqueCode(ctx context.Context) (string, error) {
	for i := 0; i < 5; i++ {
		kode, err := utils.GenerateCode(10)
		if err != nil {
			return "", err
		}
		existing, err := u.logRepo.GetByKodeUnik(ctx, kode)
		if err != nil {
			return "", err
		}
		if existing == nil {
			return kode, nil
		}
	}
	return "", errors.New("gagal menghasilkan kode unik")
}

func (u *logCetakSuratUsecase) GetAll(ctx context.Context) ([]dto.LogCetakSuratResponseDTO, error) {
	list, err := u.logRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	result := make([]dto.LogCetakSuratResponseDTO, 0, len(list))
	for i := range list {
		result = append(result, *logCetakToDTO(&list[i]))
	}
	return result, nil
}

func (u *logCetakSuratUsecase) GetByID(ctx context.Context, id int) (*dto.LogCetakSuratResponseDTO, error) {
	if id <= 0 {
		return nil, errors.New("id wajib diisi")
	}
	l, err := u.logRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if l == nil {
		return nil, errors.New("log cetak surat tidak ditemukan")
	}
	return logCetakToDTO(l), nil
}

func (u *logCetakSuratUsecase) DownloadByKode(ctx context.Context, kodeUnik string) ([]byte, string, error) {
	if strings.TrimSpace(kodeUnik) == "" {
		return nil, "", errors.New("kode_unik wajib diisi")
	}
	l, err := u.logRepo.GetByKodeUnik(ctx, strings.TrimSpace(kodeUnik))
	if err != nil {
		return nil, "", err
	}
	if l == nil {
		return nil, "", errors.New("surat tidak ditemukan")
	}
	if l.File == "" {
		return nil, "", errors.New("surat tidak memiliki file")
	}
	pdfBytes, err := utils.DecryptArchiveFile(l.File)
	if err != nil {
		return nil, "", errors.New("gagal membaca surat terenkripsi")
	}
	return pdfBytes, "surat-" + l.KodeUnik + ".pdf", nil
}

func (u *logCetakSuratUsecase) DownloadByID(ctx context.Context, id int) ([]byte, string, error) {
	if id <= 0 {
		return nil, "", errors.New("id wajib diisi")
	}
	l, err := u.logRepo.GetByID(ctx, id)
	if err != nil {
		return nil, "", err
	}
	if l == nil {
		return nil, "", errors.New("log cetak surat tidak ditemukan")
	}
	if l.File == "" {
		return nil, "", errors.New("surat tidak memiliki file")
	}
	pdfBytes, err := utils.DecryptArchiveFile(l.File)
	if err != nil {
		return nil, "", errors.New("gagal membaca surat terenkripsi")
	}
	return pdfBytes, "surat-" + l.KodeUnik + ".pdf", nil
}

func (u *logCetakSuratUsecase) Resmikan(ctx context.Context, id int, nomorSurat string) error {
	if id <= 0 {
		return errors.New("id wajib diisi")
	}
	if strings.TrimSpace(nomorSurat) == "" {
		return errors.New("nomor_surat wajib diisi")
	}
	existing, err := u.logRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("log cetak surat tidak ditemukan")
	}
	if existing.Status == domain.LogCetakStatusDiresmikan {
		return nil
	}
	n := strings.TrimSpace(nomorSurat)
	return u.logRepo.SetDiresmikan(ctx, id, &n)
}

func (u *logCetakSuratUsecase) Verifikasi(ctx context.Context, kodeUnik string) (*dto.LogCetakSuratVerifikasiDTO, error) {
	if strings.TrimSpace(kodeUnik) == "" {
		return nil, errors.New("kode_unik wajib diisi")
	}
	l, err := u.logRepo.GetByKodeUnik(ctx, strings.TrimSpace(kodeUnik))
	if err != nil {
		return nil, err
	}
	if l == nil {
		return nil, errors.New("surat tidak ditemukan")
	}
	return &dto.LogCetakSuratVerifikasiDTO{
		KodeUnik:    l.KodeUnik,
		Status:      l.Status,
		NomorSurat:  l.NomorSurat,
		NamaPemohon: l.NamaPemohon,
		DicetakPada: l.CreatedAt,
	}, nil
}

func logCetakToDTO(l *domain.LogCetakSurat) *dto.LogCetakSuratResponseDTO {
	return &dto.LogCetakSuratResponseDTO{
		ID:           l.ID,
		KodeUnik:     l.KodeUnik,
		IDTemplate:   l.IDTemplate,
		IDPelayanan:  l.IDPelayanan,
		NamaTemplate: l.NamaTemplate,
		NamaLayanan:  l.NamaLayanan,
		NamaPemohon:  l.NamaPemohon,
		NikPemohon:   l.NikPemohon,
		NomorSurat:   l.NomorSurat,
		File:         l.File,
		Status:       l.Status,
		CreatedAt:    l.CreatedAt,
		UpdatedAt:    l.UpdatedAt,
	}
}
