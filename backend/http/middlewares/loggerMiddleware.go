package middlewares

import (
	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/helpers"
)

func RequestTimer() gin.HandlerFunc {
	return func(c *gin.Context) {
		helpers.StartTimer(c)
		c.Next()
	}
}
