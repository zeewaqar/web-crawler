package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/zeewaqar/web-crawler/server/internal/crawler"
)

// rename to avoid collision
type bulkStopPayload struct {
	IDs []uint64 `json:"ids"`
}

func BulkStop(c *gin.Context) {
	var body bulkStopPayload
	if err := c.ShouldBindJSON(&body); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	for _, id := range body.IDs {
		crawler.Cancel(id)
	}
	c.Status(http.StatusAccepted)
}
