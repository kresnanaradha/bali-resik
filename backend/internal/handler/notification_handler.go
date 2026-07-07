package handler

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v4"

	"bali-resik-backend/internal/service"
	"bali-resik-backend/pkg/httpx"
	"bali-resik-backend/pkg/response"
)

type NotificationHandler struct {
	service *service.NotificationService
}

func NewNotificationHandler(s *service.NotificationService) *NotificationHandler {
	return &NotificationHandler{service: s}
}

func (h *NotificationHandler) Register(g *echo.Group) {
	g.GET("/notifications", h.List)
	g.POST("/notifications", h.Create)
	g.PATCH("/notifications/:id/read", h.MarkAsRead)
	g.DELETE("/notifications/:id", h.Delete)
}

func (h *NotificationHandler) List(c echo.Context) error {
	page, limit := httpx.Pagination(c)
	unreadOnly := c.QueryParam("unread") == "true"
	items, total, err := h.service.List(page, limit, c.QueryParam("user_id"), unreadOnly)
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, response.Paginate(items, page, limit, total), "Notifikasi berhasil diambil")
}

func (h *NotificationHandler) Create(c echo.Context) error {
	var in service.NotificationInput
	if err := httpx.BindAndValidate(c, &in); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	n, err := h.service.Create(in)
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.Created(c, n, "Notifikasi berhasil dibuat")
}

func (h *NotificationHandler) MarkAsRead(c echo.Context) error {
	n, err := h.service.MarkAsRead(c.Param("id"))
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Notifikasi tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, n, "Notifikasi ditandai sudah dibaca")
}

func (h *NotificationHandler) Delete(c echo.Context) error {
	if err := h.service.Delete(c.Param("id")); err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.NoContent(c, "Notifikasi berhasil dihapus")
}
