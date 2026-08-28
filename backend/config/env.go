package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DB_HOST        string
	DB_PORT        string
	DB_USER        string
	DB_PASSWORD    string
	DB_NAME        string
	DB_SSL_MODE    string
	SECRET_KEY     string
	AllowedOrigins []string
}

var AppConfig *Config

func LoadConfig() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment")
	}

	AppConfig = &Config{
		DB_HOST:        os.Getenv("DB_HOST"),
		DB_PORT:        os.Getenv("DB_PORT"),
		DB_USER:        os.Getenv("DB_USER"),
		DB_PASSWORD:    os.Getenv("DB_PASSWORD"),
		DB_NAME:        os.Getenv("DB_NAME"),
		DB_SSL_MODE:    os.Getenv("DB_SSL_MODE"),
		SECRET_KEY:     os.Getenv("SECRET_KEY"),
		AllowedOrigins: []string{os.Getenv("DEV_ORIGIN"), os.Getenv("PROD_ORIGIN")},
	}
}
