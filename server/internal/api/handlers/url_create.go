package handlers

import (
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/zeewaqar/web-crawler/server/internal/crawler"
	"github.com/zeewaqar/web-crawler/server/internal/database"
	"github.com/zeewaqar/web-crawler/server/internal/models"
)

type createURLRequest struct {
	URL string `json:"url" binding:"required"`
}

func CreateURL(c *gin.Context) {
	var req createURLRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "invalid body"})
		return
	}

	raw := strings.TrimSpace(req.URL)
	parsed, err := url.Parse(raw)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") {
		c.JSON(400, gin.H{"error": "must be http or https"})
		return
	}

	// upsert-or-return existing row
	u := models.URL{OriginalURL: raw}
	if err := database.DB.Where("original_url = ?", raw).
		FirstOrCreate(&u).Error; err != nil {
		c.JSON(500, gin.H{"error": "db error"})
		return
	}

	if u.CrawlStatus == "queued" { // only push if never processed
		crawler.Jobs <- u.ID
	}

	c.JSON(202, gin.H{"id": u.ID})
}
