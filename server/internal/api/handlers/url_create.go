package handlers

import (
	"net/http"
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/zeewaqar/web-crawler/server/internal/crawler"
	"github.com/zeewaqar/web-crawler/server/internal/database"
	"github.com/zeewaqar/web-crawler/server/internal/models"
)

// payload for bulk endpoints
type createURLRequest struct {
	URL string `json:"url" binding:"required"`
}

func CreateURL(c *gin.Context) {
	// 1️⃣ validate body
	var req createURLRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}

	raw := strings.TrimSpace(req.URL)
	parsed, err := url.Parse(raw)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "must be http or https"})
		return
	}

	// extract user ID from context
	uidAny, _ := c.Get("uid")
	uid := uidAny.(uint64)

	// 2️⃣ upsert-or-return existing row
	u := models.URL{
		OriginalURL: raw,
		CrawlStatus: "queued",
		UserID:      uid,
	}

	result := database.DB.
		Where("original_url = ? AND user_id = ?", raw, uid).
		FirstOrCreate(&u)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
		return
	}

	// 3️⃣ enqueue only if newly inserted
	if result.RowsAffected == 1 {
		crawler.Jobs <- u.ID
	}

	c.JSON(http.StatusAccepted, gin.H{"id": u.ID})
}
