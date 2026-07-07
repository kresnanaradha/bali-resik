package validate

import "github.com/go-playground/validator/v10"

// EchoValidator adapts go-playground/validator to echo.Echo's Validator interface.
type EchoValidator struct {
	validator *validator.Validate
}

func New() *EchoValidator {
	return &EchoValidator{validator: validator.New()}
}

func (v *EchoValidator) Validate(i any) error {
	return v.validator.Struct(i)
}
