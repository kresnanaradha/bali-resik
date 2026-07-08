package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"

	"bali-resik-backend/internal/service"
	"bali-resik-backend/pkg/response"
)

type AnalyticsHandler struct {
	service *service.AnalyticsService
}

func NewAnalyticsHandler(s *service.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{service: s}
}

func (h *AnalyticsHandler) Register(g *echo.Group) {
	g.GET("/analytics/overview", h.Overview)
	g.GET("/analytics/weekly-trend", h.WeeklyTrend)
	g.GET("/analytics/waste-distribution", h.WasteDistribution)
	g.GET("/analytics/mitra-performance", h.MitraPerformance)
	g.GET("/analytics/district-report", h.DistrictReport)
}

// parseRange reads "7d"/"30d" style query params into a day count, defaulting to 7.
func parseRange(c echo.Context) int {
	raw := strings.TrimSuffix(c.QueryParam("range"), "d")
	days, err := strconv.Atoi(raw)
	if err != nil || days < 1 {
		return 7
	}
	return days
}

func (h *AnalyticsHandler) Overview(c echo.Context) error {
	stats, err := h.service.Overview(parseRange(c))
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, stats, "Ringkasan analitik berhasil diambil")
}

func (h *AnalyticsHandler) WeeklyTrend(c echo.Context) error {
	trend, err := h.service.WeeklyTrend(parseRange(c))
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, trend, "Tren mingguan berhasil diambil")
}

func (h *AnalyticsHandler) WasteDistribution(c echo.Context) error {
	dist, err := h.service.WasteDistribution(parseRange(c))
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, dist, "Distribusi sampah berhasil diambil")
}

func (h *AnalyticsHandler) MitraPerformance(c echo.Context) error {
	limit, err := strconv.Atoi(c.QueryParam("limit"))
	if err != nil || limit < 1 {
		limit = 10
	}
	rows, err := h.service.MitraPerformance(parseRange(c), limit)
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, rows, "Kinerja mitra berhasil diambil")
}

func (h *AnalyticsHandler) DistrictReport(c echo.Context) error {
	rows, err := h.service.DistrictReport(parseRange(c))
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, rows, "Laporan per distrik berhasil diambil")
}
