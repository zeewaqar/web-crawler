package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	// ── internal packages ─────────────────────────────
	"github.com/zeewaqar/web-crawler/server/internal/api"
	"github.com/zeewaqar/web-crawler/server/internal/auth"
	"github.com/zeewaqar/web-crawler/server/internal/crawler"
	"github.com/zeewaqar/web-crawler/server/internal/database"
)

func main() {

	// 1️⃣  Database bootstrap
	database.Init()
	if err := database.RunMigrations(); err != nil {
		log.Fatal("migrations failed:", err)
	}
	auth.Init(os.Getenv("JWT_SECRET"))
	// 2️⃣  Start crawler workers (2×CPU)
	for i := 0; i < runtime.NumCPU()*2; i++ {
		go crawler.Worker(crawler.Jobs)
	}

	// 3️⃣  Gin router & routes
	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())

	// 👇 CORS middleware — allow dev front-end & optional localhost ports
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"ok": true})
	})

	api.Register(router) // mounts /api/v1/…

	// 4️⃣  HTTP server in its own goroutine
	srv := &http.Server{
		Addr:    ":8080",
		Handler: router,
	}
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %v", err)
		}
	}()
	log.Println("API listening on :8080")

	// 5️⃣  Wait for Ctrl-C / docker stop
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("shutdown signal received")

	// 6️⃣  Graceful shutdown sequence
	crawler.CloseQueue() // stop workers
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = srv.Shutdown(ctx) // stop HTTP server (ignore err)

	log.Println("api exited cleanly")
}
