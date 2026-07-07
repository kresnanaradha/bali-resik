package handler

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v4"

	"bali-resik-backend/internal/service"
	"bali-resik-backend/pkg/httpx"
	"bali-resik-backend/pkg/response"
)

type TpsLocationHandler struct {
	service *service.TpsLocationService
}

func NewTpsLocationHandler(s *service.TpsLocationService) *TpsLocationHandler {
	return &TpsLocationHandler{service: s}
}

func (h *TpsLocationHandler) Register(g *echo.Group) {
	g.GET("/tps-locations", h.List)
	g.GET("/tps-locations/:id", h.Get)
	g.POST("/tps-locations", h.Create)
	g.PATCH("/tps-locations/:id", h.Update)
	g.DELETE("/tps-locations/:id", h.Delete)
}

func (h *TpsLocationHandler) List(c echo.Context) error {
	locations, err := h.service.ListAll(c.QueryParam("search"), c.QueryParam("district_id"))
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, locations, "Daftar TPS3R berhasil diambil")
}

func (h *TpsLocationHandler) Get(c echo.Context) error {
	loc, err := h.service.Get(c.Param("id"))
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Lokasi TPS3R tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, loc, "Detail TPS3R berhasil diambil")
}

func (h *TpsLocationHandler) Create(c echo.Context) error {
	var in service.TpsLocationInput
	if err := httpx.BindAndValidate(c, &in); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	loc, err := h.service.Create(in)
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.Created(c, loc, "TPS3R berhasil ditambahkan")
}

func (h *TpsLocationHandler) Update(c echo.Context) error {
	var in service.TpsLocationInput
	if err := httpx.BindAndValidate(c, &in); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	loc, err := h.service.Update(c.Param("id"), in)
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Lokasi TPS3R tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, loc, "TPS3R berhasil diperbarui")
}

func (h *TpsLocationHandler) Delete(c echo.Context) error {
	err := h.service.Delete(c.Param("id"))
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Lokasi TPS3R tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.NoContent(c, "TPS3R berhasil dihapus")
}
