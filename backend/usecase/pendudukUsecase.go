package usecase

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/dto"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
)

var nikPattern = regexp.MustCompile(`^[0-9]{16}$`)
var noKKPattern = regexp.MustCompile(`^[0-9]{16}$`)

var validJenisKelamin = map[string]bool{
	domain.JenisKelaminLaki:      true,
	domain.JenisKelaminPerempuan: true,
}

func validateJenisKelamin(jenisKelamin string) error {
	if !validJenisKelamin[jenisKelamin] {
		return domain.NewValidation("jenis kelamin tidak valid")
	}
	return nil
}

func validateNIK(nik string) error {
	nik = strings.TrimSpace(nik)
	if !nikPattern.MatchString(nik) {
		return domain.NewValidation("NIK harus 16 digit angka")
	}
	return nil
}

func validateNoKK(noKK string) error {
	noKK = strings.TrimSpace(noKK)
	if noKK == "" {
		return nil
	}
	if !noKKPattern.MatchString(noKK) {
		return domain.NewValidation("nomor KK harus 16 digit angka")
	}
	return nil
}

func (u *pendudukUsecase) kepalaKeluargaStatusID(ctx context.Context) (int, error) {
	s, err := u.statusKeluargaRepo.GetByNama(ctx, domain.NamaStatusKepalaKeluarga)
	if err != nil {
		return 0, err
	}
	if s == nil {
		return 0, domain.NewValidation("status \"" + domain.NamaStatusKepalaKeluarga + "\" belum tersedia, jalankan seeder status keluarga")
	}
	return s.ID, nil
}

func (u *pendudukUsecase) validateStatusKeluarga(ctx context.Context, statusID *int) error {
	if statusID == nil {
		return domain.NewValidation("status keluarga wajib dipilih")
	}
	s, err := u.statusKeluargaRepo.GetByID(ctx, *statusID)
	if err != nil {
		return err
	}
	if s == nil {
		return domain.NewNotFound("status keluarga tidak ditemukan")
	}
	return nil
}

type pendudukUsecase struct {
	pendudukRepo       domain.PendudukRepository
	statusKeluargaRepo domain.StatusKeluargaRepository
}

func NewPendudukUsecase(pendudukRepo domain.PendudukRepository, statusKeluargaRepo domain.StatusKeluargaRepository) PendudukUsecase {
	return &pendudukUsecase{
		pendudukRepo:       pendudukRepo,
		statusKeluargaRepo: statusKeluargaRepo,
	}
}

func (u *pendudukUsecase) Create(ctx context.Context, req dto.PendudukRequestDTO) error {
	if err := validateNIK(req.NIK); err != nil {
		return err
	}
	if strings.TrimSpace(req.Nama) == "" {
		return domain.NewValidation("nama wajib diisi")
	}
	if err := validateJenisKelamin(req.JenisKelamin); err != nil {
		return err
	}
	if err := u.validateStatusKeluarga(ctx, req.IDStatusKeluarga); err != nil {
		return err
	}
	if err := validateNoKK(req.NomorKK); err != nil {
		return err
	}

	cleanNIK := strings.TrimSpace(req.NIK)
	nikHash := utils.HashHex(cleanNIK)
	existing, err := u.pendudukRepo.GetByNIKHash(ctx, nikHash)
	if err != nil {
		return err
	}
	if existing != nil {
		return domain.NewValidation("NIK sudah terdaftar")
	}

	if err := u.validateFamily(ctx, req.IDStatusKeluarga, req.IDKepalakeluarga, 0); err != nil {
		return err
	}

	p := &domain.Penduduk{
		NIKHash:          nikHash,
		NIK:              cleanNIK,
		Nama:             req.Nama,
		Alamat:           req.Alamat,
		TanggalLahir:     req.TanggalLahir,
		TempatLahir:      req.TempatLahir,
		NoKK:             strings.TrimSpace(req.NomorKK),
		JenisKelamin:     req.JenisKelamin,
		Agama:            req.Agama,
		Pekerjaan:        req.Pekerjaan,
		IDStatusKeluarga: req.IDStatusKeluarga,
		IDKepalakeluarga: req.IDKepalakeluarga,
	}

	pEncrypted, err := u.encrypt(p)
	if err != nil {
		return errors.New("gagal memproses enkripsi data")
	}

	return u.pendudukRepo.Create(ctx, pEncrypted)
}

func (u *pendudukUsecase) GetByNIK(ctx context.Context, nik string) (*dto.PendudukResponseDTO, error) {
	if err := validateNIK(nik); err != nil {
		return nil, err
	}
	p, err := u.pendudukRepo.GetByNIKHash(ctx, utils.HashHex(strings.TrimSpace(nik)))
	if err != nil {
		return nil, err
	}
	if p == nil {
		return nil, domain.NewNotFound("penduduk tidak ditemukan")
	}

	decrypted, err := u.decrypt(p)
	if err != nil {
		return nil, err
	}
	return pendudukToDTO(decrypted), nil
}

func (u *pendudukUsecase) GetAll(ctx context.Context) ([]dto.PendudukResponseDTO, error) {
	list, err := u.pendudukRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return u.toDTOList(list)
}

func (u *pendudukUsecase) GetKepalaKeluarga(ctx context.Context) ([]dto.PendudukResponseDTO, error) {
	statusID, err := u.kepalaKeluargaStatusID(ctx)
	if err != nil {
		return nil, err
	}
	list, err := u.pendudukRepo.GetKepalaKeluargaByStatusID(ctx, statusID)
	if err != nil {
		return nil, err
	}
	return u.toDTOList(list)
}

func (u *pendudukUsecase) Update(ctx context.Context, req dto.PendudukUpdateRequestDTO) error {
	if strings.TrimSpace(req.NIK) == "" {
		return domain.NewValidation("NIK wajib diisi")
	}

	existing, err := u.pendudukRepo.GetByNIKHash(ctx, utils.HashHex(strings.TrimSpace(req.NIK)))
	if err != nil {
		return err
	}
	if existing == nil {
		return domain.NewNotFound("penduduk tidak ditemukan")
	}

	current, err := u.decrypt(existing)
	if err != nil {
		return err
	}

	newNIK := current.NIK
	if req.NewNIK != nil {
		if err := validateNIK(*req.NewNIK); err != nil {
			return err
		}
		newNIK = strings.TrimSpace(*req.NewNIK)
		if dup, err := u.pendudukRepo.GetByNIKHash(ctx, utils.HashHex(newNIK)); err != nil {
			return err
		} else if dup != nil && dup.ID != existing.ID {
			return domain.NewValidation("NIK baru sudah terdaftar")
		}
	}

	statusID := current.IDStatusKeluarga
	if req.IDStatusKeluarga != nil {
		if err := u.validateStatusKeluarga(ctx, req.IDStatusKeluarga); err != nil {
			return err
		}
		statusID = req.IDStatusKeluarga
	}

	kkStatusID, err := u.kepalaKeluargaStatusID(ctx)
	if err != nil {
		return err
	}

	jenisKelamin := current.JenisKelamin
	if req.JenisKelamin != nil {
		if err := validateJenisKelamin(*req.JenisKelamin); err != nil {
			return err
		}
		jenisKelamin = *req.JenisKelamin
	}

	var kkID *int
	switch {
	case statusID != nil && *statusID == kkStatusID:
		kkID = nil
	case req.IDStatusKeluarga != nil || req.IDKepalakeluarga != nil:
		if req.IDKepalakeluarga == nil {
			return domain.NewValidation("anggota keluarga wajib memiliki kepala keluarga")
		}
		if err := u.validateFamily(ctx, statusID, req.IDKepalakeluarga, existing.ID); err != nil {
			return err
		}
		kkID = req.IDKepalakeluarga
	default:
		kkID = existing.IDKepalakeluarga
	}

	name := current.Nama
	if req.Nama != nil {
		name = *req.Nama
	}
	alamat := current.Alamat
	if req.Alamat != nil {
		alamat = *req.Alamat
	}
	tanggalLahir := current.TanggalLahir
	if req.TanggalLahir != nil {
		tanggalLahir = *req.TanggalLahir
	}
	tempatLahir := current.TempatLahir
	if req.TempatLahir != nil {
		tempatLahir = *req.TempatLahir
	}
	noKK := current.NoKK
	if req.NomorKK != nil {
		if err := validateNoKK(*req.NomorKK); err != nil {
			return err
		}
		noKK = strings.TrimSpace(*req.NomorKK)
	}
	agama := current.Agama
	if req.Agama != nil {
		agama = *req.Agama
	}
	pekerjaan := current.Pekerjaan
	if req.Pekerjaan != nil {
		pekerjaan = *req.Pekerjaan
	}

	p := &domain.Penduduk{
		NIKHash:          utils.HashHex(newNIK),
		NIK:              newNIK,
		Nama:             name,
		Alamat:           alamat,
		TanggalLahir:     tanggalLahir,
		TempatLahir:      tempatLahir,
		NoKK:             noKK,
		JenisKelamin:     jenisKelamin,
		Agama:            agama,
		Pekerjaan:        pekerjaan,
		IDStatusKeluarga: statusID,
		IDKepalakeluarga: kkID,
	}

	pEncrypted, err := u.encrypt(p)
	if err != nil {
		return errors.New("gagal memproses enkripsi data")
	}

	return u.pendudukRepo.Update(ctx, existing.ID, pEncrypted)
}

func (u *pendudukUsecase) Delete(ctx context.Context, nik string) error {
	if err := validateNIK(nik); err != nil {
		return err
	}

	nikHash := utils.HashHex(strings.TrimSpace(nik))
	p, err := u.pendudukRepo.GetByNIKHash(ctx, nikHash)
	if err != nil {
		return err
	}
	if p == nil {
		return domain.NewNotFound("penduduk tidak ditemukan")
	}

	kkStatusID, err := u.kepalaKeluargaStatusID(ctx)
	if err != nil {
		return err
	}
	if p.IDStatusKeluarga != nil && *p.IDStatusKeluarga == kkStatusID {
		deps, err := u.pendudukRepo.CountDependents(ctx, p.ID)
		if err != nil {
			return err
		}
		if deps > 0 {
			return domain.NewValidation("tidak dapat menghapus kepala keluarga yang masih memiliki anggota")
		}
	}

	deleted, err := u.pendudukRepo.Delete(ctx, nikHash)
	if err != nil {
		return err
	}
	if !deleted {
		return domain.NewNotFound("penduduk tidak ditemukan")
	}
	return nil
}

func (u *pendudukUsecase) validateFamily(ctx context.Context, statusID *int, kkID *int, selfID int) error {
	kkStatusID, err := u.kepalaKeluargaStatusID(ctx)
	if err != nil {
		return err
	}

	if statusID != nil && *statusID == kkStatusID {
		if kkID != nil {
			return domain.NewValidation("kepala keluarga tidak boleh memiliki id kepala keluarga")
		}
		return nil
	}

	if kkID == nil {
		return domain.NewValidation("anggota keluarga wajib memiliki kepala keluarga")
	}
	if selfID != 0 && *kkID == selfID {
		return domain.NewValidation("tidak dapat menjadikan diri sendiri sebagai kepala keluarga")
	}

	kk, err := u.pendudukRepo.GetByID(ctx, *kkID)
	if err != nil {
		return err
	}
	if kk == nil {
		return domain.NewNotFound("kepala keluarga tidak ditemukan")
	}
	if kk.IDStatusKeluarga == nil || *kk.IDStatusKeluarga != kkStatusID {
		return domain.NewValidation("id kepala keluarga harus merupakan kepala keluarga")
	}
	return nil
}

func (u *pendudukUsecase) CountTotal(ctx context.Context) (int, error) {
	return u.pendudukRepo.CountTotal(ctx)
}

func (u *pendudukUsecase) CountKepalaKeluarga(ctx context.Context) (int, error) {
	statusID, err := u.kepalaKeluargaStatusID(ctx)
	if err != nil {
		return 0, err
	}
	return u.pendudukRepo.CountByStatusID(ctx, statusID)
}

func (u *pendudukUsecase) CountLakiLaki(ctx context.Context) (int, error) {
	return u.pendudukRepo.CountByJenisKelamin(ctx, domain.JenisKelaminLaki)
}

func (u *pendudukUsecase) CountPerempuan(ctx context.Context) (int, error) {
	return u.pendudukRepo.CountByJenisKelamin(ctx, domain.JenisKelaminPerempuan)
}

func (u *pendudukUsecase) GetReligiStats(ctx context.Context) ([]dto.ReligiStatsDTO, error) {
	rows, err := u.pendudukRepo.GetStatsRows(ctx)
	if err != nil {
		return nil, err
	}

	counts := make(map[string]int)
	for _, r := range rows {
		agama := strings.TrimSpace(r.Agama)
		if agama == "" {
			continue
		}
		counts[agama]++
	}

	result := make([]dto.ReligiStatsDTO, 0, len(counts))
	for agama, jumlah := range counts {
		result = append(result, dto.ReligiStatsDTO{Agama: agama, Jumlah: jumlah})
	}
	sort.Slice(result, func(i, j int) bool {
		if result[i].Jumlah == result[j].Jumlah {
			return result[i].Agama < result[j].Agama
		}
		return result[i].Jumlah > result[j].Jumlah
	})
	return result, nil
}

func (u *pendudukUsecase) GetUmurStats(ctx context.Context) ([]dto.UmurStatsDTO, error) {
	rows, err := u.pendudukRepo.GetStatsRows(ctx)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	counts := make(map[string]int)
	for _, r := range rows {
		if strings.TrimSpace(r.TanggalLahir) == "" {
			continue
		}
		t, err := parseTanggalLahir(r.TanggalLahir)
		if err != nil {
			continue
		}
		counts[umurGroup(t, now)]++
	}

	result := make([]dto.UmurStatsDTO, 0, len(counts))
	for rentang, jumlah := range counts {
		result = append(result, dto.UmurStatsDTO{Rentang: rentang, Jumlah: jumlah})
	}
	sort.Slice(result, func(i, j int) bool {
		return umurGroupOrder(result[i].Rentang) < umurGroupOrder(result[j].Rentang)
	})
	return result, nil
}

func (u *pendudukUsecase) toDTOList(list []domain.Penduduk) ([]dto.PendudukResponseDTO, error) {
	result := make([]dto.PendudukResponseDTO, 0, len(list))
	for i := range list {
		p, err := u.decrypt(&list[i])
		if err != nil {
			return nil, err
		}
		result = append(result, *pendudukToDTO(p))
	}
	return result, nil
}

func (u *pendudukUsecase) encrypt(p *domain.Penduduk) (*domain.Penduduk, error) {
	if p == nil {
		return nil, nil
	}
	key := utils.GetMasterKEK()
	var err error

	if p.NIK != "" {
		if p.NIK, err = utils.EncryptString(p.NIK, key); err != nil {
			return nil, err
		}
	}
	if p.Nama != "" {
		if p.Nama, err = utils.EncryptString(p.Nama, key); err != nil {
			return nil, err
		}
	}
	if p.NoKK != "" {
		if p.NoKK, err = utils.EncryptString(p.NoKK, key); err != nil {
			return nil, err
		}
	}
	if p.Alamat != "" {
		if p.Alamat, err = utils.EncryptString(p.Alamat, key); err != nil {
			return nil, err
		}
	}

	return p, nil
}

func (u *pendudukUsecase) decrypt(p *domain.Penduduk) (*domain.Penduduk, error) {
	if p == nil {
		return nil, nil
	}
	key := utils.GetMasterKEK()

	res := *p
	var err error

	if res.NIK, err = utils.DecryptString(p.NIK, key); err != nil {
		return nil, domain.NewInternal("Gagal mendekripsi data penduduk", fmt.Errorf("nik: %w", err))
	}
	if res.Nama, err = utils.DecryptString(p.Nama, key); err != nil {
		return nil, domain.NewInternal("Gagal mendekripsi data penduduk", fmt.Errorf("nama: %w", err))
	}
	if res.Alamat, err = utils.DecryptString(p.Alamat, key); err != nil {
		return nil, domain.NewInternal("Gagal mendekripsi data penduduk", fmt.Errorf("alamat: %w", err))
	}
	if res.NoKK, err = utils.DecryptString(p.NoKK, key); err != nil {
		return nil, domain.NewInternal("Gagal mendekripsi data penduduk", fmt.Errorf("nomor_kk: %w", err))
	}
	if p.KKNama != "" {
		if res.KKNama, err = utils.DecryptString(p.KKNama, key); err != nil {
			return nil, domain.NewInternal("Gagal mendekripsi data penduduk", fmt.Errorf("nama_kepala_keluarga: %w", err))
		}
	}

	return &res, nil
}

func pendudukToDTO(p *domain.Penduduk) *dto.PendudukResponseDTO {
	return &dto.PendudukResponseDTO{
		ID:                 p.ID,
		NIK:                p.NIK,
		Nama:               p.Nama,
		Alamat:             p.Alamat,
		TanggalLahir:       p.TanggalLahir,
		TempatLahir:        p.TempatLahir,
		NomorKK:            p.NoKK,
		JenisKelamin:       p.JenisKelamin,
		Agama:              p.Agama,
		Pekerjaan:          p.Pekerjaan,
		IDStatusKeluarga:   p.IDStatusKeluarga,
		StatusNama:         p.StatusNama,
		IDKepalakeluarga:   p.IDKepalakeluarga,
		NamaKepalakeluarga: p.KKNama,
	}
}

var umurGroupOrderMap = map[string]int{
	"0-5":   0,
	"6-12":  1,
	"13-17": 2,
	"18-30": 3,
	"31-50": 4,
	"51-70": 5,
	"70+":   6,
}

func umurGroupOrder(group string) int {
	if order, ok := umurGroupOrderMap[group]; ok {
		return order
	}
	return 99
}

func parseTanggalLahir(value string) (time.Time, error) {
	value = strings.TrimSpace(value)
	layouts := []string{"2006-01-02", "02-01-2006", "02/01/2006", "2-1-2006", "2/1/2006"}
	for _, layout := range layouts {
		if t, err := time.Parse(layout, value); err == nil {
			return t, nil
		}
	}
	return time.Time{}, domain.NewValidation("format tanggal lahir tidak valid")
}

func umurGroup(tanggal time.Time, now time.Time) string {
	age := now.Year() - tanggal.Year()
	if now.YearDay() < tanggal.YearDay() {
		age--
	}
	switch {
	case age <= 5:
		return "0-5"
	case age <= 12:
		return "6-12"
	case age <= 17:
		return "13-17"
	case age <= 30:
		return "18-30"
	case age <= 50:
		return "31-50"
	case age <= 70:
		return "51-70"
	default:
		return "70+"
	}
}
