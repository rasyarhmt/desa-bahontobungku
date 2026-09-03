package dto

type (
	PendudukRequestDTO struct {
		NIK              string `json:"nik" binding:"required"`
		Nama             string `json:"nama" binding:"required"`
		Alamat           string `json:"alamat"`
		TanggalLahir     string `json:"tanggal_lahir"`
		TempatLahir      string `json:"tempat_lahir"`
		JenisKelamin     string `json:"jenis_kelamin" binding:"required"`
		Agama            string `json:"agama"`
		Status           string `json:"status"`
		IDKepalakeluarga *int   `json:"id_kepalakeluarga"`
	}

	PendudukUpdateRequestDTO struct {
		NIK              string  `json:"nik" binding:"required"`
		NewNIK           *string `json:"new_nik"`
		Nama             *string `json:"nama"`
		Alamat           *string `json:"alamat"`
		TanggalLahir     *string `json:"tanggal_lahir"`
		TempatLahir      *string `json:"tempat_lahir"`
		JenisKelamin     *string `json:"jenis_kelamin"`
		Agama            *string `json:"agama"`
		Status           *string `json:"status"`
		IDKepalakeluarga *int    `json:"id_kepalakeluarga"`
	}

	PendudukResponseDTO struct {
		ID                 int    `json:"id"`
		NIK                string `json:"nik"`
		Nama               string `json:"nama"`
		Alamat             string `json:"alamat"`
		TanggalLahir       string `json:"tanggal_lahir"`
		TempatLahir        string `json:"tempat_lahir"`
		JenisKelamin       string `json:"jenis_kelamin"`
		Agama              string `json:"agama"`
		Status             string `json:"status"`
		IDKepalakeluarga   *int   `json:"id_kepalakeluarga"`
		NamaKepalakeluarga string `json:"nama_kepalakeluarga,omitempty"`
	}

	StatCountDTO struct {
		Total int `json:"total"`
	}

	ReligiStatsDTO struct {
		Agama  string `json:"agama"`
		Jumlah int    `json:"jumlah"`
	}

	UmurStatsDTO struct {
		Rentang string `json:"rentang"`
		Jumlah  int    `json:"jumlah"`
	}
)
