package database

import (
	"log"
	"os"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init() {
	dsn := os.Getenv("DB_DSN")
	var err error
	for i := 0; i < 10; i++ {
		DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err == nil {
			return
		}
		log.Println("DB not ready, retrying...", err)
		time.Sleep(3 * time.Second)
	}
	log.Fatalf("could not connect to DB: %v", err)
}
