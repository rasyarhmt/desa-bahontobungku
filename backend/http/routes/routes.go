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
		AllowHeaders:     []string{"Origin", "Authorization", "application/json"},
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
		penduduk.PUT("/update", application.PendudukHandler.Update)
		penduduk.DELETE("/delete/:nik", application.PendudukHandler.Delete)
		penduduk.GET("/kepala-keluarga", application.PendudukHandler.GetKepalaKeluarga)
	}

	return router
}
