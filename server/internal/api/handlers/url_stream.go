package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/zeewaqar/web-crawler/server/internal/crawler"
	"github.com/zeewaqar/web-crawler/server/internal/database"
	"github.com/zeewaqar/web-crawler/server/internal/models"
)

func StreamProgress(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid id"})
		return
	}

	// 1️⃣  DB check: if already done, emit 100 and return
	var rec models.URL
	if err := database.DB.Select("crawl_status").First(&rec, id).Error; err != nil {
		c.JSON(404, gin.H{"error": "not found"})
		return
	}
	if rec.CrawlStatus == "done" || rec.CrawlStatus == "error" {
		c.Header("Content-Type", "text/event-stream")
		fmt.Fprintf(c.Writer, "event: progress\ndata: 100\n\n")
		return
	}

	// 2️⃣  Subscribe for live updates
	ch, cancel := crawler.Subscribe(id)
	defer cancel()

	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	flusher, _ := c.Writer.(http.Flusher)

	// initial 0 (still running)
	fmt.Fprintf(c.Writer, "event: progress\ndata: 0\n\n")
	flusher.Flush()

	for pct := range ch {
		fmt.Fprintf(c.Writer, "event: progress\ndata: %d\n\n", pct)
		flusher.Flush()
		if pct >= 100 {
			break
		}
	}
}
