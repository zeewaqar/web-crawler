// server/internal/auth/require.go
package auth

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// RequireJWT checks for a JWT in either the Authorization header or
// the ?token= query-param (for EventSource streams).
func RequireJWT() gin.HandlerFunc {
	return func(c *gin.Context) {
		var tokenString string

		// 1) Try Authorization header
		if authHeader := c.GetHeader("Authorization"); strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		}

		// 2) Fallback to ?token= for SSE
		if tokenString == "" {
			if t := c.Query("token"); t != "" {
				tokenString = t
			}
		}

		if tokenString == "" {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		// parse & validate
		uid, err := Parse(tokenString)
		if err != nil {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		// inject user-id for handlers
		c.Set("uid", uid)
		c.Next()
	}
}
