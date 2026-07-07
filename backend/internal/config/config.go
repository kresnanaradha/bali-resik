package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port              string
	DBDSN             string
	AllowedOrigin     string
	AuthMode          string // "firebase" | "dev"
	FirebaseProjectID string // required when AuthMode == "firebase"
}

func Load() *Config {
	_ = godotenv.Load()

	return &Config{
		Port:              getEnv("PORT", "8080"),
		DBDSN:             getEnv("DB_DSN", "root:@tcp(127.0.0.1:3306)/bali_resik?charset=utf8mb4&parseTime=True&loc=Local"),
		AllowedOrigin:     getEnv("ALLOWED_ORIGIN", "http://localhost:5173"),
		AuthMode:          getEnv("AUTH_MODE", "dev"),
		FirebaseProjectID: getEnv("FIREBASE_PROJECT_ID", ""),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
