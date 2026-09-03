package helpers

import (
	"encoding/json"
	"errors"
	"io"

	"github.com/gin-gonic/gin"
)

func DecodeJSON(c *gin.Context, v interface{}) error {
	if c.Request.Body == nil {
		return errors.New("request body is empty")
	}

	decoder := json.NewDecoder(c.Request.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(v); err != nil {
		if err == io.EOF {
			return errors.New("request body is empty")
		}
		return err
	}

	if decoder.More() {
		return errors.New("request body must contain only one JSON object")
	}

	return nil
}
