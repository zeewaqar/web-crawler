package test

import (
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/zeewaqar/web-crawler/server/internal/database"
	"github.com/zeewaqar/web-crawler/server/internal/models"
)

func InitInMemoryDB() {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		log.Fatalf("sqlite open: %v", err)
	}
	// create only the tables needed for auth tests
	_ = db.AutoMigrate(&models.User{})
	database.DB = db
}
