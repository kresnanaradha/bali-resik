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

type MitraHandler struct {
	service *service.MitraService
}

func NewMitraHandler(s *service.MitraService) *MitraHandler {
	return &MitraHandler{service: s}
}

func (h *MitraHandler) Register(g *echo.Group) {
	g.GET("/mitra", h.List)
	g.GET("/mitra/stats", h.Stats)
	g.GET("/mitra/:id", h.Get)
	g.POST("/mitra", h.Create)
	g.PATCH("/mitra/:id", h.Update)
	g.PATCH("/mitra/:id/status", h.UpdateStatus)
	g.DELETE("/mitra/:id", h.Delete)
	g.GET("/mitra/:id/documents", h.ListDocuments)
	g.PATCH("/mitra/:id/documents/:docId/status", h.UpdateDocumentStatus)
}

func (h *MitraHandler) List(c echo.Context) error {
	page, limit := httpx.Pagination(c)
	filter := repository.MitraFilter{
		Search: c.QueryParam("search"),
		Status: c.QueryParam("status"),
	}
	mitra, total, err := h.service.List(page, limit, filter)
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, response.Paginate(mitra, page, limit, total), "Daftar mitra berhasil diambil")
}

func (h *MitraHandler) Stats(c echo.Context) error {
	stats, err := h.service.Stats()
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, stats, "Statistik mitra berhasil diambil")
}

func (h *MitraHandler) Get(c echo.Context) error {
	mitra, err := h.service.Get(c.Param("id"))
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Mitra tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, mitra, "Detail mitra berhasil diambil")
}

func (h *MitraHandler) Create(c echo.Context) error {
	var in service.MitraInput
	if err := httpx.BindAndValidate(c, &in); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	mitra, err := h.service.Create(in)
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.Created(c, mitra, "Mitra baru berhasil ditambahkan")
}

func (h *MitraHandler) Update(c echo.Context) error {
	var in service.UpdateMitraInput
	if err := httpx.BindAndValidate(c, &in); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	mitra, err := h.service.Update(c.Param("id"), in)
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Mitra tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, mitra, "Mitra berhasil diperbarui")
}

func (h *MitraHandler) UpdateStatus(c echo.Context) error {
	var body struct {
		Status string `json:"status" validate:"required,oneof=pending_verification active inactive"`
	}
	if err := httpx.BindAndValidate(c, &body); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	mitra, err := h.service.UpdateStatus(c.Param("id"), body.Status)
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Mitra tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, mitra, "Status mitra berhasil diperbarui")
}

func (h *MitraHandler) Delete(c echo.Context) error {
	err := h.service.Delete(c.Param("id"))
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Mitra tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.NoContent(c, "Mitra berhasil dihapus")
}

func (h *MitraHandler) ListDocuments(c echo.Context) error {
	docs, err := h.service.ListDocuments(c.Param("id"))
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, docs, "Dokumen mitra berhasil diambil")
}

func (h *MitraHandler) UpdateDocumentStatus(c echo.Context) error {
	var body struct {
		Status string `json:"status" validate:"required,oneof=pending verified rejected"`
	}
	if err := httpx.BindAndValidate(c, &body); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	doc, err := h.service.UpdateDocumentStatus(c.Param("id"), c.Param("docId"), body.Status)
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Dokumen tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, doc, "Status dokumen berhasil diperbarui")
}
