package routes

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/app"
	"github.com/rasyarhmt/desa-bahontobungku/config"
	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/http/middlewares"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func health(c *gin.Context) {
	c.Header("Content-Type", "application/json")
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func RegisterRoutes(application app.App) http.Handler {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     config.AppConfig.AllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type", "ngrok-skip-browser-warning"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	v1 := router.Group("/api/v1")

	// PUBLIC ROUTES,[]
	v1.GET("/health", health)

	auth := v1.Group("/auth")
	{
		auth.POST("/login", application.AuthHandler.Login)
		auth.POST("/refresh", application.AuthHandler.RefreshToken)
		auth.POST("/reset-password", application.UserHandler.ResetPassword)

		auth.Use(middlewares.AuthMiddleware())
		{
			auth.POST("/logout", application.AuthHandler.Logout)
		}
	}

	user := v1.Group("/user")
	{
		user.POST("/reset-password", application.UserHandler.ResetPassword)
		user.Use(middlewares.AuthMiddleware())
		{
			user.GET("/current-user", application.UserHandler.GetCurrentUser)
			user.PUT("/update", application.UserHandler.UpdateProfile)
		}

		admin := user.Group("")
		admin.Use(middlewares.RequireRole(domain.RoleSuperadmin))
		{
			admin.POST("/add", application.UserHandler.AddUser)
			admin.GET("/all", application.UserHandler.GetAllUsers)
			admin.DELETE("/:id", application.UserHandler.DeleteUser)
			admin.POST("/transfer-superadmin", application.UserHandler.TransferSuperadmin)
		}
	}

	pendudukPublic := v1.Group("/penduduk/stats")
	{
		pendudukPublic.GET("/total", application.PendudukHandler.GetTotalStats)
		pendudukPublic.GET("/kepala-keluarga", application.PendudukHandler.GetKepalaKeluargaStats)
		pendudukPublic.GET("/laki-laki", application.PendudukHandler.GetLakiLakiStats)
		pendudukPublic.GET("/perempuan", application.PendudukHandler.GetPerempuanStats)
		pendudukPublic.GET("/agama", application.PendudukHandler.GetReligiStats)
		pendudukPublic.GET("/umur", application.PendudukHandler.GetUmurStats)
	}

	penduduk := v1.Group("/penduduk")
	penduduk.Use(middlewares.AuthMiddleware())
	{
		penduduk.GET("/", application.PendudukHandler.GetAll)
		penduduk.GET("/nik/:nik", application.PendudukHandler.GetByNIK)
		penduduk.POST("/", application.PendudukHandler.Create)
		penduduk.PUT("/update/:nik", application.PendudukHandler.Update)
		penduduk.DELETE("/delete/:nik", application.PendudukHandler.Delete)
		penduduk.GET("/kepala-keluarga", application.PendudukHandler.GetKepalaKeluarga)
	}

	suratTemplate := v1.Group("/surat-template")
	suratTemplate.Use(middlewares.AuthMiddleware())
	{
		suratTemplate.POST("/", application.SuratTemplateHandler.Create)
		suratTemplate.GET("/", application.SuratTemplateHandler.GetAll)
		suratTemplate.GET("/:id", application.SuratTemplateHandler.GetByID)
		suratTemplate.PUT("/:id", application.SuratTemplateHandler.Update)
		suratTemplate.DELETE("/:id", application.SuratTemplateHandler.Delete)
		suratTemplate.PUT("/:id/toggle-status", application.SuratTemplateHandler.ToggleStatus)
	}

	pelayanan := v1.Group("/pelayanan")
	{
		pelayanan.GET("/", application.PelayananHandler.GetAll)
		pelayanan.GET("/:id", application.PelayananHandler.GetByID)
		pelayanan.GET("/:id/surat/fields", application.PelayananHandler.GetTemplateFields)
		pelayanan.POST("/:id/surat", application.LogCetakSuratHandler.Ajukan)

		pelayanan.Use(middlewares.AuthMiddleware())
		{
			pelayanan.POST("/", application.PelayananHandler.Create)
			pelayanan.PUT("/:id", application.PelayananHandler.Update)
			pelayanan.DELETE("/:id", application.PelayananHandler.Delete)
			pelayanan.PUT("/:id/toggle-status", application.PelayananHandler.ToggleStatus)
		}
	}

	suratMasuk := v1.Group("/surat-masuk")
	suratMasuk.Use(middlewares.AuthMiddleware())
	{
		suratMasuk.POST("/", application.SuratMasukHandler.Create)
		suratMasuk.GET("/", application.SuratMasukHandler.GetAll)
		suratMasuk.GET("/:id", application.SuratMasukHandler.GetByID)
		suratMasuk.GET("/:id/file", application.SuratMasukHandler.DownloadFile)
		suratMasuk.PUT("/:id", application.SuratMasukHandler.Update)
		suratMasuk.DELETE("/:id", application.SuratMasukHandler.Delete)
	}

	suratKeluar := v1.Group("/surat-keluar")
	suratKeluar.Use(middlewares.AuthMiddleware())
	{
		suratKeluar.POST("/", application.SuratKeluarHandler.Create)
		suratKeluar.GET("/", application.SuratKeluarHandler.GetAll)
		suratKeluar.GET("/:id", application.SuratKeluarHandler.GetByID)
		suratKeluar.GET("/:id/file", application.SuratKeluarHandler.DownloadFile)
		suratKeluar.PUT("/:id", application.SuratKeluarHandler.Update)
		suratKeluar.DELETE("/:id", application.SuratKeluarHandler.Delete)
	}

	logCetakSurat := v1.Group("/log-cetak-surat")
	logCetakSurat.Use(middlewares.AuthMiddleware())
	{
		logCetakSurat.GET("/", application.LogCetakSuratHandler.GetAll)
		logCetakSurat.GET("/:id", application.LogCetakSuratHandler.GetByID)
		logCetakSurat.GET("/:id/file", application.LogCetakSuratHandler.DownloadByID)
		logCetakSurat.PUT("/:id/resmikan", application.LogCetakSuratHandler.Resmikan)
	}

	logCetakSuratPublic := v1.Group("/log-cetak-surat")
	{
		logCetakSuratPublic.GET("/verifikasi/:kode_unik", application.LogCetakSuratHandler.Verifikasi)
		logCetakSuratPublic.GET("/verifikasi/:kode_unik/qr", application.LogCetakSuratHandler.QR)
		logCetakSuratPublic.GET("/surat/:kode_unik/file", application.LogCetakSuratHandler.DownloadByKode)
	}

	beritaPublic := v1.Group("/berita")
	{
		beritaPublic.GET("/", application.BeritaHandler.GetAll)
		beritaPublic.GET("/status/:status", application.BeritaHandler.GetByStatus)
		beritaPublic.GET("/:id", application.BeritaHandler.GetByID)
	}

	berita := v1.Group("/berita")
	berita.Use(middlewares.AuthMiddleware())
	{
		berita.GET("/admin", application.BeritaHandler.GetAllAdmin)
		berita.GET("/admin/:id", application.BeritaHandler.GetByIDAdmin)
		berita.POST("/", application.BeritaHandler.Create)
		berita.PUT("/:id", application.BeritaHandler.Update)
		berita.DELETE("/:id", application.BeritaHandler.Delete)
		berita.PUT("/:id/toggle-status", application.BeritaHandler.ToggleStatus)
	}

	pengumuman := v1.Group("/pengumuman")
	{
		pengumuman.GET("/", application.PengumumanHandler.GetAll)
		pengumuman.GET("/:id", application.PengumumanHandler.GetByID)
		pengumuman.POST("/", middlewares.AuthMiddleware(), application.PengumumanHandler.Create)
		pengumuman.PUT("/:id", middlewares.AuthMiddleware(), application.PengumumanHandler.Update)
		pengumuman.DELETE("/:id", middlewares.AuthMiddleware(), application.PengumumanHandler.Delete)
	}

	dana := v1.Group("/dana/apbdes")
	{
		dana.GET("/summary/:tahun", application.DanaHandler.GetSummary)
		dana.GET("/detail/:tahun", application.DanaHandler.GetDetail)
		dana.GET("/dana-masuk", application.DanaHandler.GetAllMasuk)
		dana.GET("/dana-keluar", application.DanaHandler.GetAllKeluar)
		dana.GET("/dana-masuk/:id", application.DanaHandler.GetMasukByID)
		dana.GET("/dana-keluar/:id", application.DanaHandler.GetKeluarByID)
		dana.POST("/dana-masuk", middlewares.AuthMiddleware(), application.DanaHandler.CreateMasuk)
		dana.POST("/dana-keluar", middlewares.AuthMiddleware(), application.DanaHandler.CreateKeluar)
		dana.PUT("/dana-masuk/:id", middlewares.AuthMiddleware(), application.DanaHandler.UpdateMasuk)
		dana.PUT("/dana-keluar/:id", middlewares.AuthMiddleware(), application.DanaHandler.UpdateKeluar)
		dana.DELETE("/dana-masuk/:id", middlewares.AuthMiddleware(), application.DanaHandler.DeleteMasuk)
		dana.DELETE("/dana-keluar/:id", middlewares.AuthMiddleware(), application.DanaHandler.DeleteKeluar)
	}

	media := v1.Group("/media")
	{
		media.GET("/", application.MediaHandler.GetAll)
		media.GET("/:id", application.MediaHandler.GetByID)
		media.POST("/", middlewares.AuthMiddleware(), application.MediaHandler.Create)
		media.PUT("/:id", middlewares.AuthMiddleware(), application.MediaHandler.Update)
		media.DELETE("/:id", middlewares.AuthMiddleware(), application.MediaHandler.Delete)
	}

	aparatur := v1.Group("/aparatur")
	{
		aparatur.GET("/", application.AparaturHandler.GetAll)
		aparatur.GET("/nip/:nip", middlewares.AuthMiddleware(), application.AparaturHandler.GetByNIP)
		aparatur.GET("/:id", middlewares.AuthMiddleware(), application.AparaturHandler.GetByID)
		aparatur.POST("/", middlewares.AuthMiddleware(), application.AparaturHandler.Create)
		aparatur.PUT("/:id", middlewares.AuthMiddleware(), application.AparaturHandler.Update)
		aparatur.DELETE("/:id", middlewares.AuthMiddleware(), application.AparaturHandler.Delete)
	}

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	router.Static("/uploads/berita", "./uploads/berita")
	router.Static("/uploads/media", "./uploads/media")
	router.Static("/uploads/aparatur", "./uploads/aparatur")

	return router
}
