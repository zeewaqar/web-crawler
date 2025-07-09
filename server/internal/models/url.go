package models

import "time"

type URL struct {
	ID            uint64  `gorm:"primaryKey"`
	OriginalURL   string  `gorm:"size:768;uniqueIndex"`
	CrawlStatus   string  `gorm:"column:crawl_status;type:enum('queued','running','done','error');default:'queued'"` // 👈 add this
	HTMLVersion   *string `gorm:"size:16"`
	Title         *string `gorm:"size:512"`
	H1, H2, H3    int
	InternalLinks int
	ExternalLinks int
	BrokenLinks   int
	HasLogin      bool
	CreatedAt     time.Time
	UpdatedAt     time.Time
	Links         []Link `gorm:"constraint:OnDelete:CASCADE"`
}

type Link struct {
	ID         uint64 `gorm:"primaryKey"`
	URLID      uint64
	Href       string `gorm:"size:2048"`
	Status     *int16 // nil until checked
	IsInternal bool
	CheckedAt  *time.Time
}
