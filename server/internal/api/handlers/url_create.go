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
	/* ── 1. validate body ───────────────────────────────────────── */
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

	/* ── 2. upsert-or-return existing row ───────────────────────── */
	u := models.URL{
		OriginalURL: raw,
		CrawlStatus: "queued", // 💡 explicit valid value for new rows
	}

	result := database.DB.
		Where("original_url = ?", raw).
		FirstOrCreate(&u)

	if result.Error != nil {
		c.JSON(500, gin.H{"error": "db error"})
		return
	}

	/* ── 3. enqueue only if row was newly created ───────────────── */
	if result.RowsAffected == 1 { // row was inserted, not fetched
		crawler.Jobs <- u.ID
	}

	c.JSON(202, gin.H{"id": u.ID})
}
