package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/zeewaqar/web-crawler/server/internal/database"
	"github.com/zeewaqar/web-crawler/server/internal/models"
)

func GetURLDetail(c *gin.Context) {
	// parse URL ID
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	// get user ID
	uidAny, _ := c.Get("uid")
	uid := uidAny.(uint64)

	// only fetch if URL belongs to this user
	var urlRec models.URL
	if err := database.DB.
		Preload("Links").
		Where("id = ? AND user_id = ?", id, uid).
		First(&urlRec).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	// ensure non‐nil slice for JSON
	if urlRec.Links == nil {
		urlRec.Links = []models.Link{}
	}

	c.JSON(http.StatusOK, urlRec)
}
