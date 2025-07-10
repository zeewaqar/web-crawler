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
	// --- query params with sane defaults ---
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 20
	}
	q := strings.TrimSpace(c.Query("q"))

	var rows []models.URL
	tx := database.DB.
		Limit(size).
		Offset((page - 1) * size).
		Order("created_at DESC")

	if q != "" {
		like := "%" + q + "%"
		tx = tx.Where("original_url LIKE ?", like)
	}

	if err := tx.Find(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db"})
		return
	}

	// total count (for pagination UI)
	var total int64
	countTx := database.DB.Model(&models.URL{})
	if q != "" {
		countTx = countTx.Where("original_url LIKE ?", "%"+q+"%")
	}
	countTx.Count(&total)

	c.JSON(http.StatusOK, gin.H{
		"data":  rows,
		"total": total,
	})
}
