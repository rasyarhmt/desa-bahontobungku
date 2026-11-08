package helpers

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/sirupsen/logrus"
)

const requestStartKey = "request_start"

type HttpResponse struct {
	Code    int         `json:"code" example:"200"`
	Message string      `json:"message" example:"Success"`
	Data    interface{} `json:"data,omitempty"`
}

func StartTimer(c *gin.Context) {
	c.Set(requestStartKey, time.Now())
}

func Response(c *gin.Context, data HttpResponse) {
	duration := time.Duration(0)
	if start, ok := c.Get(requestStartKey); ok {
		if startedAt, ok := start.(time.Time); ok {
			duration = time.Since(startedAt)
		}
	}

	logrus.WithFields(logrus.Fields{
		"method":   c.Request.Method,
		"path":     c.Request.URL.Path,
		"status":   data.Code,
		"duration": duration.String(),
	}).Info("http request")

	c.JSON(data.Code, data)
}

func statusFor(kind domain.ErrorKind) int {
	switch kind {
	case domain.KindValidation:
		return http.StatusBadRequest
	case domain.KindNotFound:
		return http.StatusNotFound
	case domain.KindUnauthorized:
		return http.StatusUnauthorized
	case domain.KindForbidden:
		return http.StatusForbidden
	case domain.KindConflict:
		return http.StatusConflict
	default:
		return http.StatusInternalServerError
	}
}

func logServerError(c *gin.Context, err error) {
	fields := logrus.Fields{}
	if c.Request != nil {
		fields["method"] = c.Request.Method
		fields["path"] = c.Request.URL.Path
	}
	logrus.WithError(err).WithFields(fields).Error("http request failed")
}

func RespondError(c *gin.Context, err error) {
	if err == nil {
		return
	}

	code := http.StatusInternalServerError
	message := "Terjadi kesalahan pada server"

	var appErr *domain.AppError
	switch {
	case errors.As(err, &appErr):
		code = statusFor(appErr.Kind)
		message = appErr.Error()
		if appErr.Kind == domain.KindInternal {
			logServerError(c, err)
		}
	case errors.Is(err, domain.ErrNotFound):
		code = http.StatusNotFound
		message = err.Error()
	case errors.Is(err, domain.ErrUnauthorized):
		code = http.StatusUnauthorized
		message = err.Error()
	case errors.Is(err, domain.ErrForbidden):
		code = http.StatusForbidden
		message = err.Error()
	case errors.Is(err, domain.ErrConflict):
		code = http.StatusConflict
		message = err.Error()
	case errors.Is(err, domain.ErrValidation):
		code = http.StatusBadRequest
		message = err.Error()
	case errors.Is(err, domain.ErrInternal):
		code = http.StatusInternalServerError
		logServerError(c, err)
	default:
		logServerError(c, err)
	}

	c.JSON(code, HttpResponse{
		Code:    code,
		Message: message,
	})
}
