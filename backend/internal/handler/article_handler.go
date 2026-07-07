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

type ArticleHandler struct {
	service *service.ArticleService
}

func NewArticleHandler(s *service.ArticleService) *ArticleHandler {
	return &ArticleHandler{service: s}
}

func (h *ArticleHandler) Register(g *echo.Group) {
	g.GET("/articles", h.List)
	g.GET("/articles/stats", h.Stats)
	g.GET("/articles/:id", h.Get)
	g.POST("/articles", h.Create)
	g.PATCH("/articles/:id", h.Update)
	g.PATCH("/articles/:id/publish", h.Publish)
	g.DELETE("/articles/:id", h.Delete)
	g.GET("/chatbot/articles", h.ForChatbot)
}

func (h *ArticleHandler) List(c echo.Context) error {
	page, limit := httpx.Pagination(c)
	filter := repository.ArticleFilter{
		Search:   c.QueryParam("search"),
		Status:   c.QueryParam("status"),
		Category: c.QueryParam("category"),
		AuthorID: c.QueryParam("author_id"),
	}
	articles, total, err := h.service.List(page, limit, filter)
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, response.Paginate(articles, page, limit, total), "Daftar artikel berhasil diambil")
}

func (h *ArticleHandler) Stats(c echo.Context) error {
	stats, err := h.service.Stats()
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, stats, "Statistik artikel berhasil diambil")
}

func (h *ArticleHandler) Get(c echo.Context) error {
	article, err := h.service.Get(c.Param("id"))
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Artikel tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, article, "Detail artikel berhasil diambil")
}

func (h *ArticleHandler) Create(c echo.Context) error {
	var in service.ArticleInput
	if err := httpx.BindAndValidate(c, &in); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	article, err := h.service.Create(in)
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.Created(c, article, "Artikel berhasil dibuat")
}

func (h *ArticleHandler) Update(c echo.Context) error {
	var in service.ArticleInput
	if err := httpx.BindAndValidate(c, &in); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	article, err := h.service.Update(c.Param("id"), in)
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Artikel tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, article, "Artikel berhasil diperbarui")
}

func (h *ArticleHandler) Publish(c echo.Context) error {
	var body struct {
		Published bool `json:"published"`
	}
	if err := httpx.BindAndValidate(c, &body); err != nil {
		return response.Fail(c, http.StatusBadRequest, err.Error())
	}
	article, err := h.service.SetPublished(c.Param("id"), body.Published)
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Artikel tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	msg := "Artikel berhasil dipublikasikan"
	if !body.Published {
		msg = "Artikel berhasil diubah menjadi draft"
	}
	return response.OK(c, article, msg)
}

func (h *ArticleHandler) Delete(c echo.Context) error {
	err := h.service.Delete(c.Param("id"))
	if errors.Is(err, service.ErrNotFound) {
		return response.Fail(c, http.StatusNotFound, "Artikel tidak ditemukan")
	}
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.NoContent(c, "Artikel berhasil dihapus")
}

func (h *ArticleHandler) ForChatbot(c echo.Context) error {
	articles, err := h.service.ForChatbot()
	if err != nil {
		return response.Fail(c, http.StatusInternalServerError, err.Error())
	}
	return response.OK(c, articles, "Artikel untuk chatbot berhasil diambil")
}
