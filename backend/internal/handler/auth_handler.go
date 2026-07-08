package handler

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v4"

	appmw "bali-resik-backend/internal/middleware"
	"bali-resik-backend/internal/service"
	"bali-resik-backend/pkg/httpx"
	"bali-resik-backend/pkg/response"
)

type AuthHandler struct {
	service *service.AuthService
}

func NewAuthHandler(s *service.AuthService) *AuthHandler {
	return &AuthHandler{service: s}
}

// RegisterPublic wires /auth/register and /auth/login — these must NOT sit
// behind the Auth middleware group, since logging in is how a caller gets a
// token in the first place.
func (h *AuthHandler) RegisterPublic(g *echo.Group) {
	g.POST("/auth/register", h.RegisterAccount)
	g.POST("/auth/login", h.Login)
}

// Register wires the routes that need an already-resolved identity — token
// verification and user lookup/auto-provisioning happen in the Auth
// middleware for every protected route; these handlers just surface it.
func (h *AuthHandler) Register(g *echo.Group) {
	g.POST("/auth/verify", h.Verify)
	g.GET("/auth/me", h.Me)
	g.POST("/auth/logout", h.Logout)
}

type authResponse struct {
	User  any    `json:"user"`
	Token string `json:"token"`
}

func (h *AuthHandler) RegisterAccount(c echo.Context) error {
	var in service.RegisterInput
	if err := httpx.BindAndValidate(c, &in); err != nil {
		return response.Fail(c, http.StatusBadRequest, "Data pendaftaran tidak valid: nama, email, dan password (minimal 8 karakter) wajib diisi")
	}
	user, token, err := h.service.Register(in)
	if errors.Is(err, service.ErrEmailTaken) {
		return response.Fail(c, http.StatusConflict, "Email sudah terdaftar")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.Created(c, authResponse{User: user, Token: token}, "Pendaftaran berhasil")
}

func (h *AuthHandler) Login(c echo.Context) error {
	var in service.LoginInput
	if err := httpx.BindAndValidate(c, &in); err != nil {
		return response.Fail(c, http.StatusBadRequest, "Email dan password wajib diisi")
	}
	user, token, err := h.service.Login(in)
	if errors.Is(err, service.ErrInvalidCredentials) {
		return response.Fail(c, http.StatusUnauthorized, "Email atau password salah")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, authResponse{User: user, Token: token}, "Login berhasil")
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
