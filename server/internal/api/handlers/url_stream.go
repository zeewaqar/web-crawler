package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/zeewaqar/web-crawler/server/internal/crawler"
)

func StreamProgress(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid id"})
		return
	}

	// Subscribe
	ch, cancel := crawler.Subscribe(id)
	defer cancel()

	// SSE headers
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")

	// Flush writer
	flusher, _ := c.Writer.(http.Flusher)

	// initial event
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
