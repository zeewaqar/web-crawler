package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/zeewaqar/web-crawler/server/internal/crawler"
	"github.com/zeewaqar/web-crawler/server/internal/database"
	"github.com/zeewaqar/web-crawler/server/internal/models"
)

type bulkIds struct {
	IDs []uint64 `json:"ids" binding:"required"`
}

func BulkRestart(c *gin.Context) {
	var body bulkIds
	if err := c.ShouldBindJSON(&body); err != nil || len(body.IDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ids required"})
		return
	}

	// reset crawl_status + stats
	if err := database.DB.Model(&models.URL{}).
		Where("id IN ?", body.IDs).
		Updates(map[string]any{
			"crawl_status":   "queued",
			"internal_links": 0, "external_links": 0, "broken_links": 0,
			"h1": 0, "h2": 0, "h3": 0,
			"has_login": false,
		}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db"})
		return
	}

	// enqueue each id
	for _, id := range body.IDs {
		crawler.Jobs <- id
	}

	c.JSON(http.StatusAccepted, gin.H{"restarted": len(body.IDs)})
}
