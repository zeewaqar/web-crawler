package auth

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func RequireJWT() gin.HandlerFunc {
	return func(c *gin.Context) {
		h := c.GetHeader("Authorization")
		parts := strings.SplitN(h, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		id, err := Parse(parts[1])
		if err != nil {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		c.Set("uid", id) // pass user-id downstream
		c.Next()
	}
}
