package config

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func InitDB() {
	db, err := NewDB()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	DB = db
	log.Println("MySQL Database connected and pool initialized successfully")
}

func NewDB() (*sql.DB, error) {
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local&tls=%s&timeout=5s&readTimeout=10s&writeTimeout=10s&multiStatements=true",
		AppConfig.DB_USER,
		AppConfig.DB_PASSWORD,
		AppConfig.DB_HOST,
		AppConfig.DB_PORT,
		AppConfig.DB_NAME,
		AppConfig.DB_SSL_MODE,
	)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database connection: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(15 * time.Minute)
	db.SetConnMaxIdleTime(5 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return db, nil
}
