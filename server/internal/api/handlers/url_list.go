package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/zeewaqar/web-crawler/server/internal/database"
	"github.com/zeewaqar/web-crawler/server/internal/models"
)

func ListURLs(c *gin.Context) {
	// pull user ID from context
	uidAny, _ := c.Get("uid")
	uid := uidAny.(uint64)

	// pagination & search params
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 20
	}
	q := strings.TrimSpace(c.Query("q"))

	// base query: only this user’s URLs
	tx := database.DB.
		Where("user_id = ?", uid).
		Limit(size).
		Offset((page - 1) * size).
		Order("created_at DESC")

	if q != "" {
		tx = tx.Where("original_url LIKE ?", "%"+q+"%")
	}

	var rows []models.URL
	if err := tx.Find(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db"})
		return
	}

	// count total for this user + filter
	var total int64
	countTx := database.DB.
		Model(&models.URL{}).
		Where("user_id = ?", uid)
	if q != "" {
		countTx = countTx.Where("original_url LIKE ?", "%"+q+"%")
	}
	countTx.Count(&total)

	c.JSON(http.StatusOK, gin.H{
		"data":  rows,
		"total": total,
	})
}
