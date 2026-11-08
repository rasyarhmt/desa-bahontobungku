package handler

import (
	"io"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/helpers"
	"github.com/rasyarhmt/desa-bahontobungku/usecase"
	"github.com/sirupsen/logrus"
)

func parseIDParam(c *gin.Context, invalidMessage string) (int, bool) {
	id, err := strconv.Atoi(strings.TrimSpace(c.Param("id")))
	if err != nil || id <= 0 {
		helpers.Response(c, helpers.HttpResponse{
			Code:    http.StatusBadRequest,
			Message: invalidMessage,
		})
		return 0, false
	}
	return id, true
}

func toUploadedFile(fh *multipart.FileHeader) (*usecase.UploadedFile, error) {
	if fh == nil {
		return nil, nil
	}
	file, err := fh.Open()
	if err != nil {
		return nil, err
	}
	defer file.Close()

	content, err := io.ReadAll(file)
	if err != nil {
		return nil, err
	}

	return &usecase.UploadedFile{
		Filename:    fh.Filename,
		Size:        fh.Size,
		Content:     content,
		ContentType: fh.Header.Get("Content-Type"),
	}, nil
}

func readUploadedFile(c *gin.Context, fh *multipart.FileHeader, readErrorMessage string) (*usecase.UploadedFile, bool) {
	file, err := toUploadedFile(fh)
	if err != nil {
		logrus.WithError(err).Error(readErrorMessage)
		helpers.Response(c, helpers.HttpResponse{
			Code:    http.StatusInternalServerError,
			Message: readErrorMessage,
		})
		return nil, false
	}
	return file, true
}
