package helpers

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"reflect"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/rasyarhmt/desa-bahontobungku/domain"
)

var validate = newValidator()

func newValidator() *validator.Validate {
	v := validator.New()
	v.SetTagName("binding")
	v.RegisterTagNameFunc(func(field reflect.StructField) string {
		name := strings.SplitN(field.Tag.Get("json"), ",", 2)[0]
		if name == "-" || name == "" {
			return field.Name
		}
		return name
	})
	return v
}

func validationError(err error) error {
	var validationErrors validator.ValidationErrors
	if !errors.As(err, &validationErrors) || len(validationErrors) == 0 {
		return err
	}

	field := validationErrors[0]
	switch field.Tag() {
	case "required":
		return domain.NewValidation(fmt.Sprintf("%s wajib diisi", field.Field()))
	case "email":
		return domain.NewValidation(fmt.Sprintf("format %s tidak valid", field.Field()))
	case "min":
		return domain.NewValidation(fmt.Sprintf("%s minimal %s karakter", field.Field(), field.Param()))
	default:
		return domain.NewValidation(fmt.Sprintf("%s tidak valid", field.Field()))
	}
}

func DecodeJSON(c *gin.Context, v interface{}) error {
	if c.Request.Body == nil {
		return domain.NewValidation("request body is empty")
	}

	decoder := json.NewDecoder(c.Request.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(v); err != nil {
		if err == io.EOF {
			return domain.NewValidation("request body is empty")
		}
		return domain.NewValidation(err.Error())
	}

	if decoder.More() {
		return domain.NewValidation("request body must contain only one JSON object")
	}

	if err := validate.Struct(v); err != nil {
		return validationError(err)
	}

	return nil
}
