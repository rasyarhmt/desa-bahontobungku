package usecase

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/rasyarhmt/desa-bahontobungku/config"
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
) LogCetakSuratUsecase {
	return &logCetakSuratUsecase{logRepo: logRepo, templateRepo: templateRepo, pelayananRepo: pelayananRepo}
}

func (u *logCetakSuratUsecase) Ajukan(ctx context.Context, idPelayanan int, req dto.AjukanSuratRequestDTO, requestHost string, isTLS bool,
) (*dto.AjukanSuratResponseDTO, error) {
	if idPelayanan <= 0 {
		return nil, domain.NewValidation("id_pelayanan tidak valid")
	}
	if strings.TrimSpace(req.NamaPemohon) == "" {
		return nil, domain.NewValidation("nama_pemohon wajib diisi")
	}
	if !nikPattern.MatchString(strings.TrimSpace(req.NikPemohon)) {
		return nil, domain.NewValidation("nik_pemohon harus 16 digit angka")
	}

	p, err := u.pelayananRepo.GetByID(ctx, idPelayanan)
	if err != nil {
		return nil, err
	}
	if p == nil {
		return nil, domain.NewNotFound("pelayanan tidak ditemukan")
	}
	if p.Status != domain.PelayananStatusAktif {
		return nil, domain.NewValidation("pelayanan tidak aktif")
	}
	if p.IDSuratTemplate <= 0 {
		return nil, domain.NewValidation("pelayanan ini belum memiliki template surat")
	}

	tpl, err := u.templateRepo.GetByID(ctx, p.IDSuratTemplate)
	if err != nil {
		return nil, err
	}
	if tpl == nil {
		return nil, domain.NewNotFound("template surat tidak ditemukan")
	}
	if tpl.Status != domain.TemplateStatusAktif {
		return nil, domain.NewValidation("template surat tidak aktif")
	}

	templateBytes, err := utils.DecryptFileContent(tpl.FileTemplate)
	if err != nil {
		return nil, domain.NewInternal("Gagal membaca template surat terenkripsi", err)
	}

	data := make(map[string]string, len(req.Data)+2)
	for k, v := range req.Data {
		key := strings.TrimSpace(k)
		if key == "" {
			continue
		}
		switch val := v.(type) {
		case string:
			data[key] = strings.TrimSpace(val)
		default:
			if b, errMarshal := json.Marshal(v); errMarshal == nil {
				data[key] = string(b)
			}
		}
	}
	data["nama_pemohon"] = strings.TrimSpace(req.NamaPemohon)
	data["nik_pemohon"] = strings.TrimSpace(req.NikPemohon)
	wita := time.FixedZone("WITA", 8*60*60)
	data["tanggal_surat"] = formatTanggalIndonesia(time.Now().In(wita))

	fields, err := utils.ExtractDOCXPlaceholders(templateBytes)
	if err != nil {
		return nil, domain.NewInternal("Gagal membaca field template surat", err)
	}
	for _, field := range fields {
		key := strings.TrimSpace(field)
		if key == "" || isBuiltinTemplateFieldKey(key) {
			continue
		}
		if strings.TrimSpace(data[key]) == "" {
			return nil, domain.NewValidation("Field " + key + " wajib diisi")
		}
	}

	kode, err := u.generateUniqueCode(ctx)
	if err != nil {
		return nil, err
	}

	var allowedOrigins []string
	if config.AppConfig != nil {
		allowedOrigins = config.AppConfig.AllowedOrigins
	}

	verifyURL := utils.BuildVerificationURL(kode, requestHost, isTLS, allowedOrigins)

	qrPNG, err := utils.GenerateQRPNG(verifyURL, 512)
	if err != nil {
		return nil, domain.NewInternal("Gagal membuat QR verifikasi surat", err)
	}

	pdfBytes, err := utils.GeneratePDFWithQR(templateBytes, data, qrPNG)
	if err != nil {
		return nil, err
	}

	filePath, err := utils.EncryptSuratFile(pdfBytes, kode)
	if err != nil {
		return nil, errors.New("gagal menyimpan surat terenkripsi")
	}

	idTemplate := p.IDSuratTemplate
	plainNama := strings.TrimSpace(req.NamaPemohon)
	l := &domain.LogCetakSurat{
		KodeUnik:    kode,
		IDTemplate:  &idTemplate,
		IDPelayanan: &idPelayanan,
		NamaPemohon: plainNama,
		NikPemohon:  strings.TrimSpace(req.NikPemohon),
		File:        filePath,
		Status:      domain.LogCetakStatusDicetak,
	}

	encryptedLog, err := u.encryptLog(l)
	if err != nil {
		_ = utils.DeleteGeneratedFile(filePath)
		return nil, errors.New("gagal memproses enkripsi data")
	}

	id, err := u.logRepo.Create(ctx, encryptedLog)
	if err != nil {
		_ = utils.DeleteGeneratedFile(filePath)
		return nil, err
	}
	l.ID = id

	return &dto.AjukanSuratResponseDTO{
		ID:          l.ID,
		KodeUnik:    l.KodeUnik,
		NamaPemohon: plainNama,
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
		item, err := logCetakToDTO(&list[i])
		if err != nil {
			return nil, err
		}
		result = append(result, *item)
	}
	return result, nil
}

func (u *logCetakSuratUsecase) GetByID(ctx context.Context, id int) (*dto.LogCetakSuratResponseDTO, error) {
	if id <= 0 {
		return nil, domain.NewValidation("id wajib diisi")
	}
	l, err := u.logRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if l == nil {
		return nil, domain.NewNotFound("log cetak surat tidak ditemukan")
	}
	item, err := logCetakToDTO(l)
	if err != nil {
		return nil, err
	}
	return item, nil
}

func (u *logCetakSuratUsecase) DownloadByKode(ctx context.Context, kodeUnik string) ([]byte, string, error) {
	if strings.TrimSpace(kodeUnik) == "" {
		return nil, "", domain.NewValidation("kode_unik wajib diisi")
	}
	l, err := u.logRepo.GetByKodeUnik(ctx, strings.TrimSpace(kodeUnik))
	if err != nil {
		return nil, "", err
	}
	if l == nil {
		return nil, "", domain.NewNotFound("surat tidak ditemukan")
	}
	if l.File == "" {
		return nil, "", domain.NewNotFound("surat tidak memiliki file")
	}
	pdfBytes, err := utils.DecryptArchiveFile(l.File)
	if err != nil {
		return nil, "", domain.NewInternal("Gagal membaca surat terenkripsi", err)
	}
	return pdfBytes, "surat-" + l.KodeUnik + ".pdf", nil
}

func (u *logCetakSuratUsecase) DownloadByID(ctx context.Context, id int) ([]byte, string, error) {
	if id <= 0 {
		return nil, "", domain.NewValidation("id wajib diisi")
	}
	l, err := u.logRepo.GetByID(ctx, id)
	if err != nil {
		return nil, "", err
	}
	if l == nil {
		return nil, "", domain.NewNotFound("log cetak surat tidak ditemukan")
	}
	if l.File == "" {
		return nil, "", domain.NewNotFound("surat tidak memiliki file")
	}
	pdfBytes, err := utils.DecryptArchiveFile(l.File)
	if err != nil {
		return nil, "", domain.NewInternal("Gagal membaca surat terenkripsi", err)
	}
	return pdfBytes, "surat-" + l.KodeUnik + ".pdf", nil
}

func (u *logCetakSuratUsecase) Resmikan(ctx context.Context, id int, nomorSurat string) error {
	if id <= 0 {
		return domain.NewValidation("id wajib diisi")
	}
	if strings.TrimSpace(nomorSurat) == "" {
		return domain.NewValidation("nomor_surat wajib diisi")
	}
	existing, err := u.logRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return domain.NewNotFound("log cetak surat tidak ditemukan")
	}
	if existing.Status == domain.LogCetakStatusDiresmikan {
		return nil
	}
	n := strings.TrimSpace(nomorSurat)
	return u.logRepo.SetDiresmikan(ctx, id, &n)
}

func (u *logCetakSuratUsecase) Verifikasi(ctx context.Context, kodeUnik string) (*dto.LogCetakSuratVerifikasiDTO, error) {
	if strings.TrimSpace(kodeUnik) == "" {
		return nil, domain.NewValidation("kode_unik wajib diisi")
	}
	l, err := u.logRepo.GetByKodeUnik(ctx, strings.TrimSpace(kodeUnik))
	if err != nil {
		return nil, err
	}
	if l == nil {
		return nil, domain.NewNotFound("surat tidak ditemukan")
	}
	d, err := decryptLog(l)
	if err != nil {
		return nil, err
	}
	return &dto.LogCetakSuratVerifikasiDTO{
		Status:      d.Status,
		NomorSurat:  d.NomorSurat,
		NamaPemohon: maskNama(d.NamaPemohon),
		DicetakPada: d.CreatedAt,
	}, nil
}

func maskNama(nama string) string {
	nama = strings.TrimSpace(nama)
	if nama == "" {
		return ""
	}

	words := strings.Fields(nama)
	for i, word := range words {
		runes := []rune(word)
		switch len(runes) {
		case 1:
			words[i] = "*"
		case 2:
			words[i] = string(runes[0]) + "*"
		default:
			words[i] = string(runes[0]) + strings.Repeat("*", len(runes)-2) + string(runes[len(runes)-1])
		}
	}
	return strings.Join(words, " ")
}

func logCetakToDTO(l *domain.LogCetakSurat) (*dto.LogCetakSuratResponseDTO, error) {
	d, err := decryptLog(l)
	if err != nil {
		return nil, err
	}
	return &dto.LogCetakSuratResponseDTO{
		ID:           d.ID,
		KodeUnik:     d.KodeUnik,
		IDTemplate:   d.IDTemplate,
		IDPelayanan:  d.IDPelayanan,
		NamaTemplate: d.NamaTemplate,
		NamaLayanan:  d.NamaLayanan,
		NamaPemohon:  d.NamaPemohon,
		NikPemohon:   d.NikPemohon,
		NomorSurat:   d.NomorSurat,
		File:         d.File,
		Status:       d.Status,
		CreatedAt:    d.CreatedAt,
		UpdatedAt:    d.UpdatedAt,
	}, nil
}

func (u *logCetakSuratUsecase) encryptLog(l *domain.LogCetakSurat) (*domain.LogCetakSurat, error) {
	if l == nil {
		return nil, nil
	}
	res := *l
	key := utils.GetMasterKEK()
	var err error

	if res.NamaPemohon != "" {
		if res.NamaPemohon, err = utils.EncryptString(res.NamaPemohon, key); err != nil {
			return nil, err
		}
	}
	if res.NikPemohon != "" {
		if res.NikPemohon, err = utils.EncryptString(res.NikPemohon, key); err != nil {
			return nil, err
		}
	}
	return &res, nil
}

func decryptLog(l *domain.LogCetakSurat) (*domain.LogCetakSurat, error) {
	if l == nil {
		return nil, nil
	}
	key := utils.GetMasterKEK()
	res := *l
	var err error

	if res.NamaPemohon, err = utils.DecryptString(l.NamaPemohon, key); err != nil {
		return nil, domain.NewInternal("Gagal mendekripsi data log cetak surat", fmt.Errorf("nama_pemohon: %w", err))
	}
	if res.NikPemohon, err = utils.DecryptString(l.NikPemohon, key); err != nil {
		return nil, domain.NewInternal("Gagal mendekripsi data log cetak surat", fmt.Errorf("nik_pemohon: %w", err))
	}
	return &res, nil
}

func formatTanggalIndonesia(t time.Time) string {
	bulan := []string{
		"Januari", "Februari", "Maret", "April", "Mei", "Juni",
		"Juli", "Agustus", "September", "Oktober", "November", "Desember",
	}
	return fmt.Sprintf("%d %s %d", t.Day(), bulan[t.Month()-1], t.Year())
}
