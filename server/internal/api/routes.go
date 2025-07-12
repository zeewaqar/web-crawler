package api

import (
	"github.com/gin-gonic/gin"
	"github.com/zeewaqar/web-crawler/server/internal/api/handlers"
	"github.com/zeewaqar/web-crawler/server/internal/auth"
)

func Register(r *gin.Engine) {
	v1 := r.Group("/api/v1")

	v1.POST("/register", handlers.Register) // public

	v1.POST("/login", handlers.Login) // public

	v1.POST("/logout", handlers.Logout)

	secured := v1.Group("/")
	secured.Use(auth.RequireJWT()) // 🔒 protected routes
	{
		secured.POST("/urls", handlers.CreateURL)
		secured.POST("/urls/bulk/restart", handlers.BulkRestart)
		secured.DELETE("/urls", handlers.BulkDelete)
		secured.PUT("/urls/:id/stop", handlers.StopURL)
		secured.POST("/urls/bulk/stop", handlers.BulkStop)
		secured.GET("/urls", handlers.ListURLs)
		secured.GET("/urls/:id", handlers.GetURLDetail)
		secured.GET("/urls/:id/stream", handlers.StreamProgress)
		// …any other modifying endpoints
	}

	// read-only endpoints can stay outside if desired

}
