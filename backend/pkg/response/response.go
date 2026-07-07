package response

import "github.com/labstack/echo/v4"

type Envelope struct {
	Success bool   `json:"success"`
	Data    any    `json:"data"`
	Message string `json:"message"`
}

type Page struct {
	Items      any   `json:"items"`
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	TotalItems int64 `json:"total_items"`
	TotalPages int   `json:"total_pages"`
}

func OK(c echo.Context, data any, message string) error {
	return c.JSON(200, Envelope{Success: true, Data: data, Message: message})
}

func Created(c echo.Context, data any, message string) error {
	return c.JSON(201, Envelope{Success: true, Data: data, Message: message})
}

func NoContent(c echo.Context, message string) error {
	return c.JSON(200, Envelope{Success: true, Data: nil, Message: message})
}

func Fail(c echo.Context, code int, message string) error {
	return c.JSON(code, Envelope{Success: false, Data: nil, Message: message})
}

func Paginate(items any, page, limit int, total int64) Page {
	totalPages := int(total) / limit
	if int(total)%limit != 0 {
		totalPages++
	}
	if totalPages < 1 {
		totalPages = 1
	}
	return Page{Items: items, Page: page, Limit: limit, TotalItems: total, TotalPages: totalPages}
}
