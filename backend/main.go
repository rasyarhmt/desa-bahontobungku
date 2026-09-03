// @title           Desa Bahontobungku API
// @version         1.0
// @description     Backend API Sistem Informasi Desa Bahontobungku
// @host            localhost:8080
// @BasePath        /api/v1
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
package main

import (
	_ "github.com/rasyarhmt/desa-bahontobungku/docs"

	"github.com/rasyarhmt/desa-bahontobungku/cmd"
	"github.com/rasyarhmt/desa-bahontobungku/config"
)

func main() {
	config.LoadConfig()
	config.InitDB()

	cmd.Execute()
}
