package handler

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v4"

	"bali-resik-backend/internal/repository"
	"bali-resik-backend/internal/service"
	"bali-resik-backend/pkg/httpx"
	"bali-resik-backend/pkg/response"
)

type UserHandler struct {
	service *service.UserService
}

func NewUserHandler(s *service.UserService) *UserHandler {
	return &UserHandler{service: s}
}

func (h *UserHandler) Register(g *echo.Group) {
	g.GET("/users", h.List)
	g.GET("/users/stats", h.Stats)
	g.GET("/users/:id", h.Get)
	g.POST("/users", h.Create)
	g.PATCH("/users/:id", h.Update)
	g.PATCH("/users/:id/status", h.UpdateStatus)
	g.PATCH("/users/:id/password", h.ResetPassword)
	g.DELETE("/users/:id", h.Delete)
}

func (h *UserHandler) List(c echo.Context) error {
	page, limit := httpx.Pagination(c)
	filter := repository.UserFilter{
		Search:     c.QueryParam("search"),
		Role:       c.QueryParam("role"),
		DistrictID: c.QueryParam("district_id"),
		Status:     c.QueryParam("status"),
	}
	users, total, err := h.service.List(page, limit, filter)
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, response.Paginate(users, page, limit, total), "Daftar pengguna berhasil diambil")
}

func (h *UserHandler) Stats(c echo.Context) error {
	stats, err := h.service.Stats()
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, stats, "Statistik pengguna berhasil diambil")
}

func (h *UserHandler) Get(c echo.Context) error {
	user, err := h.service.Get(c.Param("id"))
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Pengguna tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, user, "Detail pengguna berhasil diambil")
}

func (h *UserHandler) Create(c echo.Context) error {
	var in service.CreateUserInput
	if err := httpx.BindAndValidate(c, &in); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	user, err := h.service.Create(in)
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.Created(c, user, "Pengguna baru berhasil ditambahkan")
}

func (h *UserHandler) Update(c echo.Context) error {
	var in service.UpdateUserInput
	if err := httpx.BindAndValidate(c, &in); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	user, err := h.service.Update(c.Param("id"), in)
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Pengguna tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, user, "Pengguna berhasil diperbarui")
}

func (h *UserHandler) UpdateStatus(c echo.Context) error {
	var body struct {
		Status string `json:"status" validate:"required,oneof=active inactive suspended"`
	}
	if err := httpx.BindAndValidate(c, &body); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	user, err := h.service.UpdateStatus(c.Param("id"), body.Status)
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Pengguna tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, user, "Status pengguna berhasil diperbarui")
}

func (h *UserHandler) ResetPassword(c echo.Context) error {
	var body struct {
		Password string `json:"password" validate:"required,min=8"`
	}
	if err := httpx.BindAndValidate(c, &body); err != nil {
		return response.Fail(c, http.StatusBadRequest, "Password minimal 8 karakter")
	}
	err := h.service.SetPassword(c.Param("id"), body.Password)
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Pengguna tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, nil, "Password berhasil direset")
}

func (h *UserHandler) Delete(c echo.Context) error {
	err := h.service.Delete(c.Param("id"))
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Pengguna tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.NoContent(c, "Pengguna berhasil dihapus")
}
