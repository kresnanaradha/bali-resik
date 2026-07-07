package httpx

import (
	"strconv"

	"github.com/labstack/echo/v4"
)

// Pagination reads page/limit query params with sane defaults, shared by
// every List endpoint.
func Pagination(c echo.Context) (page, limit int) {
	page, err := strconv.Atoi(c.QueryParam("page"))
	if err != nil || page < 1 {
		page = 1
	}
	limit, err = strconv.Atoi(c.QueryParam("limit"))
	if err != nil || limit < 1 || limit > 100 {
		limit = 10
	}
	return page, limit
}

// BindAndValidate binds the request body into target and runs struct
// validation, so handlers don't repeat the bind-then-validate dance.
func BindAndValidate(c echo.Context, target any) error {
	if err := c.Bind(target); err != nil {
		return err
	}
	return c.Validate(target)
}
