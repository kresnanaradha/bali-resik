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

type PickupHandler struct {
	service *service.PickupService
}

func NewPickupHandler(s *service.PickupService) *PickupHandler {
	return &PickupHandler{service: s}
}

func (h *PickupHandler) Register(g *echo.Group) {
	g.GET("/pickups", h.List)
	g.GET("/pickups/:id", h.Get)
	g.POST("/pickups", h.Create)
	g.PATCH("/pickups/:id/status", h.UpdateStatus)
	g.DELETE("/pickups/:id", h.Delete)
}

func (h *PickupHandler) List(c echo.Context) error {
	page, limit := httpx.Pagination(c)
	filter := repository.PickupFilter{
		MitraID:    c.QueryParam("mitra_id"),
		DistrictID: c.QueryParam("district_id"),
		Status:     c.QueryParam("status"),
	}
	pickups, total, err := h.service.List(page, limit, filter)
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, response.Paginate(pickups, page, limit, total), "Daftar pengangkutan berhasil diambil")
}

func (h *PickupHandler) Get(c echo.Context) error {
	pickup, err := h.service.Get(c.Param("id"))
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Pengangkutan tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, pickup, "Detail pengangkutan berhasil diambil")
}

func (h *PickupHandler) Create(c echo.Context) error {
	var in service.PickupInput
	if err := httpx.BindAndValidate(c, &in); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	pickup, err := h.service.Create(in)
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.Created(c, pickup, "Pengangkutan berhasil dibuat")
}

func (h *PickupHandler) UpdateStatus(c echo.Context) error {
	var body struct {
		Status string `json:"status" validate:"required,oneof=scheduled in_progress completed cancelled"`
	}
	if err := httpx.BindAndValidate(c, &body); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	pickup, err := h.service.UpdateStatus(c.Param("id"), body.Status)
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Pengangkutan tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, pickup, "Status pengangkutan berhasil diperbarui")
}

func (h *PickupHandler) Delete(c echo.Context) error {
	err := h.service.Delete(c.Param("id"))
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Pengangkutan tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.NoContent(c, "Pengangkutan berhasil dihapus")
}
