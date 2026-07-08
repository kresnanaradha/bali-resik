package middleware

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"

	"bali-resik-backend/internal/config"
	"bali-resik-backend/internal/domain"
	"bali-resik-backend/internal/middleware/firebaseauth"
	"bali-resik-backend/internal/middleware/localauth"
	"bali-resik-backend/pkg/response"
)

const userContextKey = "authUser"

// Auth resolves the caller's domain.User. It tries the app's own login
// token first (issued by /auth/login or /auth/register) regardless of
// AuthMode, since that's real credential-backed auth; only when no such
// token is presented does it fall back to AuthMode's behavior — a verified
// Firebase ID token (AuthMode=firebase) or the dev bypass (AuthMode=dev,
// default) that auto-provisions a local admin user, mirroring the
// frontend's "Skip Login (Dev)" button.
func Auth(cfg *config.Config, db *gorm.DB) echo.MiddlewareFunc {
	fbVerifier := firebaseauth.NewVerifier(cfg.FirebaseProjectID)

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			bearerToken := strings.TrimPrefix(c.Request().Header.Get("Authorization"), "Bearer ")

			if bearerToken != "" {
				if userID, err := localauth.VerifyToken(cfg.JWTSecret, bearerToken); err == nil {
					var user domain.User
					if dbErr := db.First(&user, "id = ?", userID).Error; dbErr == nil {
						c.Set(userContextKey, &user)
						return next(c)
					}
				}
			}

			var firebaseUID, email, name string

			if cfg.AuthMode == "firebase" {
				if !strings.HasPrefix(c.Request().Header.Get("Authorization"), "Bearer ") {
					return response.Fail(c, http.StatusUnauthorized, "Token otorisasi tidak ditemukan")
				}
				claims, err := fbVerifier.Verify(bearerToken)
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
