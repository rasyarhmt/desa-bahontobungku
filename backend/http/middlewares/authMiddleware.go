package middlewares

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rasyarhmt/desa-bahontobungku/utils"
)

const ClaimsKey = "auth_claims"

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Akses Ditolak!",
			})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := utils.ParseAccessToken(tokenString)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Token tidak valid!",
			})
			return
		}

		c.Set(ClaimsKey, claims)
		c.Next()
	}
}

func GetAuthClaims(c *gin.Context) (*utils.JWTClaims, bool) {
	value, exists := c.Get(ClaimsKey)
	if !exists {
		return nil, false
	}
	claims, ok := value.(*utils.JWTClaims)
	return claims, ok
}
