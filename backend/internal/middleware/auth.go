package middleware

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"

	"bali-resik-backend/internal/config"
	"bali-resik-backend/internal/domain"
	"bali-resik-backend/internal/middleware/firebaseauth"
	"bali-resik-backend/pkg/response"
)

const userContextKey = "authUser"

// Auth resolves the caller's domain.User from either a verified Firebase ID
// token (AuthMode=firebase) or a dev bypass (AuthMode=dev, default) that
// auto-provisions a local admin user so the API is testable without a real
// Firebase project — mirrors the frontend's "Skip Login (Dev)" button.
func Auth(cfg *config.Config, db *gorm.DB) echo.MiddlewareFunc {
	verifier := firebaseauth.NewVerifier(cfg.FirebaseProjectID)

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			var firebaseUID, email, name string

			if cfg.AuthMode == "firebase" {
				authHeader := c.Request().Header.Get("Authorization")
				if !strings.HasPrefix(authHeader, "Bearer ") {
					return response.Fail(c, http.StatusUnauthorized, "Token otorisasi tidak ditemukan")
				}
				idToken := strings.TrimPrefix(authHeader, "Bearer ")
				claims, err := verifier.Verify(idToken)
				if err != nil {
					return response.Fail(c, http.StatusUnauthorized, err.Error())
				}
				firebaseUID = claims.Subject
				email = claims.Email
				name = email
			} else {
				firebaseUID = c.Request().Header.Get("X-Dev-Uid")
				if firebaseUID == "" {
					firebaseUID = "dev-admin-uid"
				}
				email = "dev@baliresik.go.id"
				name = "Dev Admin"
			}

			var user domain.User
			err := db.Where("firebase_uid = ?", firebaseUID).First(&user).Error
			if err != nil {
				if cfg.AuthMode != "dev" {
					return response.Fail(c, http.StatusForbidden, "Akun tidak terdaftar di sistem")
				}
				// Dev mode: auto-provision so local CRUD testing doesn't need manual seeding.
				user = domain.User{
					FirebaseUID: firebaseUID,
					FullName:    name,
					Email:       email,
					Role:        domain.RoleAdmin,
					Status:      domain.UserStatusActive,
				}
				if createErr := db.Create(&user).Error; createErr != nil {
					return response.Fail(c, http.StatusInternalServerError, "Gagal membuat akun dev otomatis")
				}
			}

			c.Set(userContextKey, &user)
			return next(c)
		}
	}
}

func RequireAdmin(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user := CurrentUser(c)
		if user == nil || user.Role != domain.RoleAdmin {
			return response.Fail(c, http.StatusForbidden, "Hanya admin yang dapat mengakses endpoint ini")
		}
		return next(c)
	}
}

func CurrentUser(c echo.Context) *domain.User {
	user, _ := c.Get(userContextKey).(*domain.User)
	return user
}
