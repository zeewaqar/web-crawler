// server/internal/api/handlers/logout.go
package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func Logout(c *gin.Context) {
	c.SetCookie("jwt", "", -1, "/", "", false, true) // expire immediately
	c.Status(http.StatusNoContent)
}
