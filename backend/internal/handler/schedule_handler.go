package handler

import (
	"errors"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"

	"bali-resik-backend/internal/repository"
	"bali-resik-backend/internal/service"
	"bali-resik-backend/pkg/httpx"
	"bali-resik-backend/pkg/response"
)

type ScheduleHandler struct {
	service *service.ScheduleService
}

func NewScheduleHandler(s *service.ScheduleService) *ScheduleHandler {
	return &ScheduleHandler{service: s}
}

func (h *ScheduleHandler) Register(g *echo.Group) {
	g.GET("/schedules", h.List)
	g.GET("/schedules/stats", h.Stats)
	g.GET("/schedules/calendar", h.Calendar)
	g.GET("/schedules/:id", h.Get)
	g.POST("/schedules", h.Create)
	g.PATCH("/schedules/:id", h.Update)
	g.DELETE("/schedules/:id", h.Delete)
	g.POST("/schedules/:id/copy", h.Copy)
	g.PATCH("/schedules/bulk-update", h.BulkUpdate)
	g.POST("/schedules/:id/exceptions", h.AddException)
	g.DELETE("/schedules/:id/exceptions/:exceptionId", h.RemoveException)
}

func (h *ScheduleHandler) List(c echo.Context) error {
	page, limit := httpx.Pagination(c)
	filter := repository.ScheduleFilter{
		DistrictID:    c.QueryParam("kecamatan"),
		Kelurahan:     c.QueryParam("kelurahan"),
		TpsLocationID: c.QueryParam("tps_location_id"),
		WasteType:     c.QueryParam("waste_type"),
		Status:        c.QueryParam("status"),
	}
	schedules, total, err := h.service.List(page, limit, filter)
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, response.Paginate(schedules, page, limit, total), "Daftar jadwal berhasil diambil")
}

func (h *ScheduleHandler) Stats(c echo.Context) error {
	stats, err := h.service.Stats()
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, stats, "Statistik jadwal berhasil diambil")
}

func (h *ScheduleHandler) Calendar(c echo.Context) error {
	dateParam := c.QueryParam("date")
	ref := time.Now()
	if dateParam != "" {
		if parsed, err := time.Parse("2006-01-02", dateParam); err == nil {
			ref = parsed
		}
	}
	events, err := h.service.Calendar(ref.Year(), ref.Month())
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, events, "Data kalender berhasil diambil")
}

func (h *ScheduleHandler) Get(c echo.Context) error {
	sch, err := h.service.Get(c.Param("id"))
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Jadwal tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, sch, "Detail jadwal berhasil diambil")
}

func (h *ScheduleHandler) Create(c echo.Context) error {
	var in service.ScheduleInput
	if err := httpx.BindAndValidate(c, &in); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	sch, err := h.service.Create(in)
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.Created(c, sch, "Jadwal berhasil dibuat")
}

func (h *ScheduleHandler) Update(c echo.Context) error {
	var in service.ScheduleInput
	if err := httpx.BindAndValidate(c, &in); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	sch, err := h.service.Update(c.Param("id"), in)
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Jadwal tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, sch, "Jadwal berhasil diperbarui")
}

func (h *ScheduleHandler) Delete(c echo.Context) error {
	err := h.service.Delete(c.Param("id"))
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Jadwal tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.NoContent(c, "Jadwal berhasil dihapus")
}

func (h *ScheduleHandler) Copy(c echo.Context) error {
	sch, err := h.service.Copy(c.Param("id"))
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Jadwal tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.Created(c, sch, "Jadwal berhasil disalin sebagai draft")
}

func (h *ScheduleHandler) BulkUpdate(c echo.Context) error {
	var body struct {
		IDs    []string `json:"ids" validate:"required,min=1"`
		Status string   `json:"status" validate:"required,oneof=draft active closed"`
	}
	if err := httpx.BindAndValidate(c, &body); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	updated, err := h.service.BulkUpdateStatus(body.IDs, body.Status)
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, map[string]int{"updated": updated}, "Jadwal berhasil diperbarui secara massal")
}

func (h *ScheduleHandler) AddException(c echo.Context) error {
	var in service.ExceptionInput
	if err := httpx.BindAndValidate(c, &in); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	exception, err := h.service.AddException(c.Param("id"), in)
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Jadwal tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.Created(c, exception, "Pengecualian jadwal berhasil ditambahkan")
}

func (h *ScheduleHandler) RemoveException(c echo.Context) error {
	if err := h.service.RemoveException(c.Param("exceptionId")); err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.NoContent(c, "Pengecualian jadwal berhasil dihapus")
}
