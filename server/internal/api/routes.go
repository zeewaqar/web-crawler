package api

import (
	"github.com/gin-gonic/gin"
	"github.com/zeewaqar/web-crawler/server/internal/api/handlers"
)

func Register(r *gin.Engine) {
	v1 := r.Group("/api/v1")

	// URL ingestion
	v1.POST("/urls", handlers.CreateURL)
	v1.GET("/urls", handlers.ListURLs)
	// Real-time crawl progress (Server-Sent Events)
	v1.GET("/urls/:id/stream", handlers.StreamProgress)
	v1.GET("/urls/:id", handlers.GetURLDetail)
	v1.POST("/urls/bulk/restart", handlers.BulkRestart)
	v1.DELETE("/urls", handlers.BulkDelete)

}
