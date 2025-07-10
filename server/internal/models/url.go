package models

import "time"

type URL struct {
	ID            uint64    `gorm:"primaryKey" json:"id"`
	OriginalURL   string    `gorm:"size:768;uniqueIndex" json:"original_url"`
	CrawlStatus   string    `gorm:"column:crawl_status" json:"crawl_status"`
	HTMLVersion   *string   `json:"html_version"`
	Title         *string   `json:"title"`
	H1            int       `json:"h1"`
	H2            int       `json:"h2"`
	H3            int       `json:"h3"`
	InternalLinks int       `json:"internal_links"`
	ExternalLinks int       `json:"external_links"`
	BrokenLinks   int       `json:"broken_links"`
	HasLogin      bool      `json:"has_login"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	Links         []Link    `json:"links,omitempty"`
}

type Link struct {
	ID         uint64 `gorm:"primaryKey"`
	URLID      uint64
	Href       string `gorm:"size:2048"`
	Status     *int16 // nil until checked
	IsInternal bool
	CheckedAt  *time.Time
}
