package handlers

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/zeewaqar/web-crawler/server/internal/auth"
	"github.com/zeewaqar/web-crawler/server/internal/database"
	"github.com/zeewaqar/web-crawler/server/internal/models"
	"golang.org/x/crypto/bcrypt"
)

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Login(c *gin.Context) {
	var req loginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "bad body"})
		return
	}

	var user models.User
	if err := database.DB.Where("email = ?", req.Email).
		First(&user).Error; err != nil {
		c.JSON(401, gin.H{"error": "invalid"})
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(user.PassHash), []byte(req.Password)) != nil {
		c.JSON(401, gin.H{"error": "invalid"})
		return
	}

	token, _ := auth.NewToken(user.ID)

	/* --------------------------------------------------------------
	   Set HTTP-only cookie (expires in 7 days, SameSite=Lax)
	   ------------------------------------------------------------ */
	oneWeek := 7 * 24 * time.Hour
	c.SetCookie("jwt", token,
		int(oneWeek.Seconds()), // max-age
		"/",                    // path
		"",                     // domain  (empty → current host)
		false,                  // secure  (true if you’re on HTTPS)
		true,                   // httpOnly
	)
	// SameSite=Lax (default for Gin >=1.8). If older Gin:
	// c.Writer.Header().Add("Set-Cookie",
	//   "jwt="+token+"; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax")

	c.JSON(200, gin.H{"token": token})
}
