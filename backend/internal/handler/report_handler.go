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

type ReportHandler struct {
	service *service.ReportService
}

func NewReportHandler(s *service.ReportService) *ReportHandler {
	return &ReportHandler{service: s}
}

func (h *ReportHandler) Register(g *echo.Group) {
	g.GET("/reports", h.List)
	g.GET("/reports/stats", h.Stats)
	g.GET("/reports/:id", h.Get)
	g.POST("/reports", h.Create)
	g.PATCH("/reports/:id/status", h.UpdateStatus)
	g.PATCH("/reports/:id/assign", h.AssignMitra)
	g.DELETE("/reports/:id", h.Delete)
}

func (h *ReportHandler) List(c echo.Context) error {
	page, limit := httpx.Pagination(c)
	filter := repository.ReportFilter{
		Search:     c.QueryParam("search"),
		Status:     c.QueryParam("status"),
		WasteType:  c.QueryParam("waste_type"),
		DistrictID: c.QueryParam("district_id"),
		DateFrom:   c.QueryParam("date_from"),
		DateTo:     c.QueryParam("date_to"),
	}
	reports, total, err := h.service.List(page, limit, filter)
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, response.Paginate(reports, page, limit, total), "Daftar laporan berhasil diambil")
}

func (h *ReportHandler) Stats(c echo.Context) error {
	stats, err := h.service.Stats()
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, stats, "Statistik laporan berhasil diambil")
}

func (h *ReportHandler) Get(c echo.Context) error {
	report, err := h.service.Get(c.Param("id"))
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Laporan tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, report, "Detail laporan berhasil diambil")
}

func (h *ReportHandler) Create(c echo.Context) error {
	var in service.CreateReportInput
	if err := httpx.BindAndValidate(c, &in); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	report, err := h.service.Create(in)
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.Created(c, report, "Laporan berhasil dibuat")
}

func (h *ReportHandler) UpdateStatus(c echo.Context) error {
	var body struct {
		Status string `json:"status" validate:"required,oneof=menunggu terverifikasi diproses selesai"`
	}
	if err := httpx.BindAndValidate(c, &body); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	report, err := h.service.UpdateStatus(c.Param("id"), body.Status)
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Laporan tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, report, "Status laporan berhasil diperbarui")
}

func (h *ReportHandler) AssignMitra(c echo.Context) error {
	var body struct {
		MitraID string `json:"mitra_id" validate:"required"`
	}
	if err := httpx.BindAndValidate(c, &body); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	report, err := h.service.AssignMitra(c.Param("id"), body.MitraID)
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Laporan tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, report, "Mitra berhasil ditugaskan")
}

func (h *ReportHandler) Delete(c echo.Context) error {
	err := h.service.Delete(c.Param("id"))
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Laporan tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.NoContent(c, "Laporan berhasil dihapus")
}
