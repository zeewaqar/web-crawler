package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/zeewaqar/web-crawler/server/internal/crawler"
)

func BulkStop(c *gin.Context) {
	var body struct {
		IDs []uint64 `json:"ids"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.Status(400)
		return
	}

	for _, id := range body.IDs {
		crawler.Cancel(id)
	}
	c.Status(202)
}
