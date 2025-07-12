package models

import "time"

/* ───────────── URLs table ───────────────────────────── */

type URL struct {
	ID            uint64    `gorm:"primaryKey"            json:"id"`
	UserID        uint64    `gorm:"not null;index" json:"-"`
	OriginalURL   string    `gorm:"size:768;uniqueIndex:idx_urls_user_url" json:"original_url"`
	CrawlStatus   string    `gorm:"default:queued"        json:"crawl_status"` // queued | running | done | error
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
	Links         []Link    `json:"links"` // one-to-many
}

/* ───────────── Links table ──────────────────────────── */

type Link struct {
	ID         uint64     `gorm:"primaryKey"      json:"-"`
	URLID      uint64     `json:"-"`
	Href       string     `gorm:"size:2048"       json:"href"`
	HTTPStatus *int       `gorm:"column:http_status" json:"http_status"` // nil until checked
	IsInternal bool       `json:"is_internal"`
	CheckedAt  *time.Time `json:"checked_at"`
}
