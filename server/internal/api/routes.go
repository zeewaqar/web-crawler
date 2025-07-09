package api

import (
	"github.com/gin-gonic/gin"
	"github.com/zeewaqar/web-crawler/server/internal/api/handlers"
)

func Register(r *gin.Engine) {
	v1 := r.Group("/api/v1")

	// URL ingestion
	v1.POST("/urls", handlers.CreateURL)

	// Real-time crawl progress (Server-Sent Events)
	v1.GET("/urls/:id/stream", handlers.StreamProgress)
}
