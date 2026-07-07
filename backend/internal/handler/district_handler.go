package handler

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v4"

	"bali-resik-backend/internal/service"
	"bali-resik-backend/pkg/httpx"
	"bali-resik-backend/pkg/response"
)

type DistrictHandler struct {
	service *service.DistrictService
}

func NewDistrictHandler(s *service.DistrictService) *DistrictHandler {
	return &DistrictHandler{service: s}
}

func (h *DistrictHandler) Register(g *echo.Group) {
	g.GET("/districts", h.List)
	g.POST("/districts", h.Create)
	g.PATCH("/districts/:id", h.Update)
	g.DELETE("/districts/:id", h.Delete)
}

func (h *DistrictHandler) List(c echo.Context) error {
	districts, err := h.service.ListAll(c.QueryParam("search"))
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, districts, "Daftar distrik berhasil diambil")
}

func (h *DistrictHandler) Create(c echo.Context) error {
	var in service.DistrictInput
	if err := httpx.BindAndValidate(c, &in); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	d, err := h.service.Create(in)
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.Created(c, d, "Distrik berhasil ditambahkan")
}

func (h *DistrictHandler) Update(c echo.Context) error {
	var in service.DistrictInput
	if err := httpx.BindAndValidate(c, &in); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	d, err := h.service.Update(c.Param("id"), in)
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Distrik tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, d, "Distrik berhasil diperbarui")
}

func (h *DistrictHandler) Delete(c echo.Context) error {
	err := h.service.Delete(c.Param("id"))
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Distrik tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.NoContent(c, "Distrik berhasil dihapus")
}
