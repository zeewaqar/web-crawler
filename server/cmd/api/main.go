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
	/* 1️⃣  Database + migrations */
	database.Init()
	if err := database.RunMigrations(); err != nil {
		log.Fatal("migrations failed:", err)
	}
	auth.Init(os.Getenv("JWT_SECRET"))

	/* 2️⃣  Start crawler workers (2× CPU) */
	for i := 0; i < runtime.NumCPU()*2; i++ {
		go crawler.Worker(crawler.Jobs)
	}

	/* 3️⃣  Gin router */
	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	router.GET("/healthz", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"ok": true}) })
	api.Register(router)

	/* 4️⃣  HTTP server */
	srv := &http.Server{Addr: ":8080", Handler: router}
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %v", err)
		}
	}()
	log.Println("API listening on :8080")

	/* 5️⃣  Wait for SIGINT / SIGTERM */
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("shutdown signal received")

	/* 6️⃣  Graceful shutdown sequence */
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// stop accepting new HTTP requests
	_ = srv.Shutdown(ctx)

	// stop crawler queue & wait for workers to finish
	close(crawler.Jobs)
	crawler.Wait()

	// close DB connection pool
	if sqlDB, err := database.DB.DB(); err == nil {
		_ = sqlDB.Close()
	}

	log.Println("api exited cleanly")
}
