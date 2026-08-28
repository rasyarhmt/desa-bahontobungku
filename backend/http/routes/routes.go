package routes

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/app"
	"github.com/rasyarhmt/desa-bahontobungku/config"
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

	// PUBLIC ROUTES
	v1.GET("/health", health)

	// auth := v1.Group("/auth")
	// {
	// 	auth.POST("/register", middlewares.RateLimitMiddleware(), application.AuthHandler.Register)
	// 	auth.POST("/verify-otp", middlewares.RateLimitMiddleware(), application.AuthHandler.VerifyRegister)
	// 	auth.POST("/resend-otp", middlewares.RateLimitMiddleware(), application.OtpCodeHandler.ResendOtpCode)

	// 	auth.POST("/login", middlewares.RateLimitMiddleware(), application.AuthHandler.Login)
	// 	auth.POST("/refresh", middlewares.RateLimitMiddleware(), application.AuthHandler.RefreshToken)
	// 	auth.POST("/logout", middlewares.AuthMiddleware(), application.AuthHandler.Logout)
	// }

	// user := v1.Group("/user")
	// user.Use(middlewares.AuthMiddleware()).Use(middlewares.RoleMiddleware(domain.RolePengguna))
	// {
	// 	user.GET("/profile", application.UserHandler.GetUserProfile)
	// 	user.GET("/transactions", application.TransaksiParkirHandler.GetAllTransaksiParkirByUserID)
	// 	user.GET("/transactions/:id", application.TransaksiParkirHandler.GetTransaksiParkirByID)
	// 	user.POST("/parking/pay", middlewares.RateLimitMiddleware(), application.TransaksiParkirHandler.CreateTransaksiParkir)
	// 	user.POST("/topup/create", middlewares.RateLimitMiddleware(), application.MidtransHandler.CreateTopUp)
	// 	user.GET("/topup/:order_id/status", application.MidtransHandler.GetTopUpStatus)

	// }

	// admin := v1.Group("/admin")
	// admin.Use(middlewares.AuthMiddleware()).Use(middlewares.RoleMiddleware(domain.RoleAdmin, domain.RoleDishub))
	// {
	// 	admin.GET("/dashboard", application.DashboardHandler.GetAdminDashboard)
	// 	admin.GET("/reports", middlewares.RateLimitMiddleware(), application.AdminHandler.GetRevenueReport)
	// 	user := admin.Group("/user")
	// 	{
	// 		user.GET("/", application.UserHandler.GetAllUsers)
	// 		user.GET("/:id", application.UserHandler.GetUserByID)
	// 		user.POST("/", application.UserHandler.CreateUser)
	// 		user.PUT("/:id", application.UserHandler.UpdateUser)
	// 		user.DELETE("/:id", application.UserHandler.DeleteUser)
	// 	}

	// 	transactions := admin.Group("/transactions").Use(middlewares.RateLimitMiddleware())
	// 	{
	// 		transactions.GET("/", application.AdminHandler.GetAllTransactions)
	// 		transactions.GET("/:id", application.AdminHandler.GetTransactionDetail)
	// 		transactions.GET("/filter-options", application.AdminHandler.GetFilterOptions)
	// 	}

	// 	locations := admin.Group("/locations")
	// 	{
	// 		locations.GET("/", application.AdminHandler.GetAllLocations)
	// 		locations.GET("/:id", application.AdminHandler.GetLocationDetail)
	// 	}

	// 	officers := admin.Group("/officers")
	// 	{
	// 		officers.GET("/", application.AdminHandler.GetAllOfficers)
	// 		officers.GET("/:id", application.AdminHandler.GetOfficerDetail)
	// 	}

	// 	lokasiParkir := admin.Group("/lokasi-parkir")
	// 	{
	// 		lokasiParkir.GET("/", application.LokasiParkirHandler.GetAllLokasiParkir)
	// 		lokasiParkir.GET("/:id", application.LokasiParkirHandler.GetLokasiParkirByID)
	// 		lokasiParkir.GET("/petugas/:petugas_id", application.LokasiParkirHandler.GetLokasiParkirByPetugasID)
	// 		lokasiParkir.POST("/", application.LokasiParkirHandler.CreateLokasiParkir)
	// 		lokasiParkir.PUT("/:id", application.LokasiParkirHandler.UpdateLokasiParkir)
	// 		lokasiParkir.DELETE("/:id", application.LokasiParkirHandler.DeleteLokasiParkir)
	// 	}
	// }

	return router
}
