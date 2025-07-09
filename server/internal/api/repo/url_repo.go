package repo

import (
	"github.com/zeewaqar/web-crawler/server/internal/database"
	"github.com/zeewaqar/web-crawler/server/internal/models"
)

func GetURLByOriginal(original string) (*models.URL, error) {
	var u models.URL
	err := database.DB.Where("original_url = ?", original).First(&u).Error
	return &u, err
}
