package dto

type (
	PendudukRequestDTO struct {
		NIK              string `json:"nik" binding:"required" example:"7371015001820001"`
		Nama             string `json:"nama" binding:"required" example:"Ahmad Fauzi"`
		Alamat           string `json:"alamat" example:"Jl. Sudirman No. 10"`
		TanggalLahir     string `json:"tanggal_lahir" example:"15-08-1990"`
		TempatLahir      string `json:"tempat_lahir" example:"Palu"`
		NomorKK          string `json:"nomor_kk" example:"7301011001230002"`
		JenisKelamin     string `json:"jenis_kelamin" binding:"required" example:"laki-laki"`
		Agama            string `json:"agama" example:"Islam"`
		Pekerjaan        string `json:"pekerjaan" example:"Petani"`
		IDStatusKeluarga *int   `json:"id_status_keluarga" example:"1"`
		IDKepalakeluarga *int   `json:"id_kepalakeluarga"`
	}

	PendudukUpdateRequestDTO struct {
		NIK              string  `json:"-"`
		NewNIK           *string `json:"new_nik" example:"7371015001820002"`
		Nama             *string `json:"nama" example:"Ahmad Fauzi Baru"`
		Alamat           *string `json:"alamat" example:"Jl. Gatot Subroto No. 5"`
		TanggalLahir     *string `json:"tanggal_lahir" example:"15-08-1990"`
		TempatLahir      *string `json:"tempat_lahir" example:"Palu"`
		NomorKK          *string `json:"nomor_kk" example:"7301011001230002"`
		JenisKelamin     *string `json:"jenis_kelamin" example:"laki-laki"`
		Agama            *string `json:"agama" example:"Islam"`
		Pekerjaan        *string `json:"pekerjaan" example:"Petani"`
		IDStatusKeluarga *int    `json:"id_status_keluarga" example:"1"`
		IDKepalakeluarga *int    `json:"id_kepalakeluarga"`
	}

	PendudukResponseDTO struct {
		ID                 int    `json:"id" example:"1"`
		NIK                string `json:"nik" example:"7371015001820001"`
		Nama               string `json:"nama" example:"Ahmad Fauzi"`
		Alamat             string `json:"alamat" example:"Jl. Sudirman No. 10"`
		TanggalLahir       string `json:"tanggal_lahir" example:"15-08-1990"`
		TempatLahir        string `json:"tempat_lahir" example:"Palu"`
		NomorKK            string `json:"nomor_kk" example:"7301011001230002"`
		JenisKelamin       string `json:"jenis_kelamin" example:"laki-laki"`
		Agama              string `json:"agama" example:"Islam"`
		Pekerjaan          string `json:"pekerjaan" example:"Petani"`
		IDStatusKeluarga   *int   `json:"id_status_keluarga" example:"1"`
		StatusNama         string `json:"status_nama" example:"kepala keluarga"`
		IDKepalakeluarga   *int   `json:"id_kepalakeluarga"`
		NamaKepalakeluarga string `json:"nama_kepalakeluarga,omitempty" example:"Suardi"`
	}

	StatCountDTO struct {
		Total int `json:"total" example:"150"`
	}

	ReligiStatsDTO struct {
		Agama  string `json:"agama" example:"Islam"`
		Jumlah int    `json:"jumlah" example:"120"`
	}

	UmurStatsDTO struct {
		Rentang string `json:"rentang" example:"18-30"`
		Jumlah  int    `json:"jumlah" example:"45"`
	}
)
