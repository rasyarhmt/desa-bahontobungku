package main

import (
	"github.com/rasyarhmt/desa-bahontobungku/cmd"
	"github.com/rasyarhmt/desa-bahontobungku/config"
)

func main() {
	config.LoadConfig()
	config.InitDB()

	cmd.Execute()
}
