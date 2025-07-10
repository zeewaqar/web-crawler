package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/zeewaqar/web-crawler/server/internal/database"
	"github.com/zeewaqar/web-crawler/server/internal/models"
	"golang.org/x/crypto/bcrypt"
)

type registerReq struct {
	Email    string `json:"email"    binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

func Register(c *gin.Context) {
	var body registerReq
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad body"})
		return
	}

	email := strings.ToLower(body.Email)
	var exists int64
	database.DB.Model(&models.User{}).
		Where("email = ?", email).
		Count(&exists)
	if exists > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "email taken"})
		return
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(body.Password), 12)
	user := models.User{Email: email, PassHash: string(hash)}
	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(500, gin.H{"error": "db error"})
		return
	}

	c.Status(http.StatusCreated)
}
