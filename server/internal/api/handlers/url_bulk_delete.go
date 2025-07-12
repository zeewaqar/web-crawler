package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/zeewaqar/web-crawler/server/internal/database"
	"github.com/zeewaqar/web-crawler/server/internal/models"
)

// rename to avoid collision
type bulkDeletePayload struct {
	IDs []uint64 `json:"ids" binding:"required"`
}

func BulkDelete(c *gin.Context) {
	var body bulkDeletePayload
	if err := c.ShouldBindJSON(&body); err != nil || len(body.IDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ids required"})
		return
	}

	uidAny, _ := c.Get("uid")
	uid := uidAny.(uint64)

	if err := database.DB.
		Where("user_id = ?", uid).
		Where("id IN ?", body.IDs).
		Delete(&models.URL{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"deleted": len(body.IDs)})
}
