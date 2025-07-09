package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	// 👇  change this to YOUR actual module path
	"github.com/zeewaqar/web-crawler/server/internal/database"
)

func main() {
	// 1️⃣ open DB (with retry loop)
	database.Init()

	// 2️⃣ run SQL migrations
	if err := database.RunMigrations(); err != nil {
		log.Fatal("migrations failed:", err)
	}

	// 3️⃣ set up HTTP server
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"ok": true})
	})

	if err := r.Run(":8080"); err != nil {
		log.Fatal("gin exited:", err)
	}
}
