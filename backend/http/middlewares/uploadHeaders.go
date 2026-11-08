package middlewares

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/config"
)

// UploadSecurityHeaders sets headers for public static uploads. It only
// constrains frame-ancestors so the frontend can embed documents (PDF) in an
// iframe, while leaving object-src/default-src unrestricted so browsers can
// render PDFs (Chrome's PDF viewer is implemented as a plugin).
func UploadSecurityHeaders() gin.HandlerFunc {
	ancestors := "'self'"
	if config.AppConfig != nil {
		for _, origin := range config.AppConfig.AllowedOrigins {
			origin = strings.TrimSpace(origin)
			if origin == "" || strings.Contains(ancestors, origin) {
				continue
			}
			ancestors += " " + origin
		}
	}
	policy := "frame-ancestors " + ancestors

	return func(c *gin.Context) {
		c.Header("Content-Security-Policy", policy)
		c.Header("X-Content-Type-Options", "nosniff")
		if strings.HasSuffix(strings.ToLower(c.Request.URL.Path), ".pdf") {
			c.Header("Content-Disposition", "inline")
		}
		c.Next()
	}
}
