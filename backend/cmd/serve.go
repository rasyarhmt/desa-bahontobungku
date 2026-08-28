package cmd

import (
	"log"
	"net/http"

	"github.com/rasyarhmt/desa-bahontobungku/app"
	"github.com/rasyarhmt/desa-bahontobungku/config"
	"github.com/rasyarhmt/desa-bahontobungku/http/routes"
	"github.com/spf13/cobra"
)

var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Run the backend server",
	Run: func(cmd *cobra.Command, args []string) {
		config.LoadConfig()
		config.InitDB()

		application := app.InitApp(config.AppConfig)

		router := routes.RegisterRoutes(application)

		addr := ":8080"
		log.Printf("Server running on %s", addr)
		if err := http.ListenAndServe(addr, router); err != nil {
			log.Fatal(err)
		}
	},
}

func init() {
	rootCmd.AddCommand(serveCmd)
}
