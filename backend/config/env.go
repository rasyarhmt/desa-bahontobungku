package config

import (
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	DB_HOST            string
	DB_PORT            string
	DB_USER            string
	DB_PASSWORD        string
	DB_NAME            string
	DB_SSL_MODE        string
	SECRET_KEY         string
	AllowedOrigins     []string
	MasterKEK          string
	AccessTokenExpiry  time.Duration
	RefreshTokenExpiry time.Duration
}

var AppConfig *Config

const (
	defaultAccessTokenExpiry  = 1 * time.Hour
	defaultRefreshTokenExpiry = 7 * 24 * time.Hour
)

func LoadConfig() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment")
	}

	AppConfig = &Config{
		DB_HOST:            os.Getenv("DB_HOST"),
		DB_PORT:            os.Getenv("DB_PORT"),
		DB_USER:            os.Getenv("DB_USER"),
		DB_PASSWORD:        os.Getenv("DB_PASSWORD"),
		DB_NAME:            os.Getenv("DB_NAME"),
		DB_SSL_MODE:        os.Getenv("DB_SSL_MODE"),
		SECRET_KEY:         os.Getenv("SECRET_KEY"),
		AllowedOrigins:     []string{os.Getenv("DEV_ORIGIN"), os.Getenv("PROD_ORIGIN")},
		MasterKEK:          os.Getenv("MasterKEK"),
		AccessTokenExpiry:  parseDuration(os.Getenv("ACCESS_TOKEN_EXPIRY"), defaultAccessTokenExpiry),
		RefreshTokenExpiry: parseDuration(os.Getenv("REFRESH_TOKEN_EXPIRY"), defaultRefreshTokenExpiry),
	}
}

func parseDuration(value string, fallback time.Duration) time.Duration {
	if value == "" {
		return fallback
	}
	d, err := time.ParseDuration(value)
	if err != nil {
		log.Printf("Invalid duration %q, using default %s", value, fallback)
		return fallback
	}
	return d
}
