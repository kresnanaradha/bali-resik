package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"bali-resik-backend/internal/service"
	"bali-resik-backend/pkg/httpx"
	"bali-resik-backend/pkg/response"
)

type PointsTransactionHandler struct {
	service *service.PointsTransactionService
}

func NewPointsTransactionHandler(s *service.PointsTransactionService) *PointsTransactionHandler {
	return &PointsTransactionHandler{service: s}
}

func (h *PointsTransactionHandler) Register(g *echo.Group) {
	g.GET("/points-transactions", h.List)
	g.POST("/points-transactions", h.Create)
}

func (h *PointsTransactionHandler) List(c echo.Context) error {
	page, limit := httpx.Pagination(c)
	items, total, err := h.service.List(page, limit, c.QueryParam("user_id"))
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, response.Paginate(items, page, limit, total), "Riwayat poin berhasil diambil")
}

func (h *PointsTransactionHandler) Create(c echo.Context) error {
	var in service.PointsTransactionInput
	if err := httpx.BindAndValidate(c, &in); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	tx, err := h.service.Create(in)
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.Created(c, tx, "Transaksi poin berhasil dicatat")
}
