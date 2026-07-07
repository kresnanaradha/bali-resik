package handler

import (
	"github.com/labstack/echo/v4"

	appmw "bali-resik-backend/internal/middleware"
	"bali-resik-backend/pkg/response"
)

// AuthHandler exposes /auth/* endpoints. Token verification and user
// lookup/auto-provisioning already happen in the Auth middleware for every
// protected route — these handlers just surface the resolved identity.
type AuthHandler struct{}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

func (h *AuthHandler) Register(g *echo.Group) {
	g.POST("/auth/verify", h.Verify)
	g.GET("/auth/me", h.Me)
	g.POST("/auth/logout", h.Logout)
}

func (h *AuthHandler) Verify(c echo.Context) error {
	return response.OK(c, appmw.CurrentUser(c), "Token valid")
}

func (h *AuthHandler) Me(c echo.Context) error {
	return response.OK(c, appmw.CurrentUser(c), "Profil berhasil diambil")
}

func (h *AuthHandler) Logout(c echo.Context) error {
	// Stateless JWT — tidak ada sesi sisi server untuk di-invalidate.
	return response.NoContent(c, "Berhasil keluar")
}
