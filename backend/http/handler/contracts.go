package handler

import "github.com/gin-gonic/gin"

type (
	AparaturHandler interface {
		Create(c *gin.Context)
		GetAll(c *gin.Context)
		GetByID(c *gin.Context)
		GetByNIP(c *gin.Context)
		Update(c *gin.Context)
		Delete(c *gin.Context)
	}

	AuthHandler interface {
		Login(c *gin.Context)
		RefreshToken(c *gin.Context)
		Logout(c *gin.Context)
	}

	BeritaHandler interface {
		Create(c *gin.Context)
		GetAll(c *gin.Context)
		GetByStatus(c *gin.Context)
		GetByID(c *gin.Context)
		GetAllAdmin(c *gin.Context)
		GetByIDAdmin(c *gin.Context)
		Update(c *gin.Context)
		ToggleStatus(c *gin.Context)
		Delete(c *gin.Context)
	}

	DanaHandler interface {
		CreateMasuk(c *gin.Context)
		CreateKeluar(c *gin.Context)
		GetAllMasuk(c *gin.Context)
		GetAllKeluar(c *gin.Context)
		GetMasukByID(c *gin.Context)
		GetKeluarByID(c *gin.Context)
		GetSummary(c *gin.Context)
		GetDetail(c *gin.Context)
		UpdateMasuk(c *gin.Context)
		UpdateKeluar(c *gin.Context)
		DeleteMasuk(c *gin.Context)
		DeleteKeluar(c *gin.Context)
	}

	LogCetakSuratHandler interface {
		Ajukan(c *gin.Context)
		GetAll(c *gin.Context)
		GetByID(c *gin.Context)
		DownloadByKode(c *gin.Context)
		DownloadByID(c *gin.Context)
		Resmikan(c *gin.Context)
		Verifikasi(c *gin.Context)
		QR(c *gin.Context)
	}

	MediaHandler interface {
		Create(c *gin.Context)
		GetAll(c *gin.Context)
		GetByID(c *gin.Context)
		Update(c *gin.Context)
		Delete(c *gin.Context)
	}

	PelayananHandler interface {
		Create(c *gin.Context)
		GetAll(c *gin.Context)
		GetByID(c *gin.Context)
		GetTemplateFields(c *gin.Context)
		Update(c *gin.Context)
		Delete(c *gin.Context)
		ToggleStatus(c *gin.Context)
	}

	PendudukHandler interface {
		Create(c *gin.Context)
		GetByNIK(c *gin.Context)
		GetAll(c *gin.Context)
		GetKepalaKeluarga(c *gin.Context)
		Update(c *gin.Context)
		Delete(c *gin.Context)
		GetTotalStats(c *gin.Context)
		GetKepalaKeluargaStats(c *gin.Context)
		GetLakiLakiStats(c *gin.Context)
		GetPerempuanStats(c *gin.Context)
		GetReligiStats(c *gin.Context)
		GetUmurStats(c *gin.Context)
	}

	PengumumanHandler interface {
		Create(c *gin.Context)
		GetAll(c *gin.Context)
		GetByID(c *gin.Context)
		Update(c *gin.Context)
		Delete(c *gin.Context)
	}

	StatusKeluargaHandler interface {
		Create(c *gin.Context)
		GetAll(c *gin.Context)
		GetByID(c *gin.Context)
		Update(c *gin.Context)
		Delete(c *gin.Context)
		ToggleActive(c *gin.Context)
	}

	SuratMasukHandler interface {
		Create(c *gin.Context)
		GetAll(c *gin.Context)
		GetByID(c *gin.Context)
		DownloadFile(c *gin.Context)
		Update(c *gin.Context)
		Delete(c *gin.Context)
	}

	SuratKeluarHandler interface {
		Create(c *gin.Context)
		GetAll(c *gin.Context)
		GetByID(c *gin.Context)
		DownloadFile(c *gin.Context)
		Update(c *gin.Context)
		Delete(c *gin.Context)
	}

	SuratTemplateHandler interface {
		Create(c *gin.Context)
		GetAll(c *gin.Context)
		GetByID(c *gin.Context)
		Update(c *gin.Context)
		Delete(c *gin.Context)
		ToggleStatus(c *gin.Context)
		GetFields(c *gin.Context)
		UpdateFields(c *gin.Context)
		Preview(c *gin.Context)
	}

	UserHandler interface {
		GetCurrentUser(c *gin.Context)
		UpdateProfile(c *gin.Context)
		AddUser(c *gin.Context)
		GetAllUsers(c *gin.Context)
		DeleteUser(c *gin.Context)
		TransferSuperadmin(c *gin.Context)
		ResetPassword(c *gin.Context)
	}
)
