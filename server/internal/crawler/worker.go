package crawler

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/zeewaqar/web-crawler/server/internal/database"
	"github.com/zeewaqar/web-crawler/server/internal/models"
)

var client = &http.Client{Timeout: 10 * time.Second}

func Worker(jobs <-chan uint64) {
	for id := range jobs {
		crawl(id)
	}
}

func crawl(id uint64) {
	// ---- ctx with global timeout ----
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// ---- initial DB fetch ----
	var rec models.URL
	if err := database.DB.First(&rec, id).Error; err != nil {
		return
	}

	// mark running + send 0 %
	database.DB.Model(&rec).Update("crawl_status", "running")
	Publish(id, 0)

	// ---- HTTP GET bound to ctx ----
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, rec.OriginalURL, nil)
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode >= 400 {
		database.DB.Model(&rec).Update("crawl_status", "error")
		Publish(id, 100)
		return
	}
	defer resp.Body.Close()

	if !strings.Contains(resp.Header.Get("Content-Type"), "text/html") {
		database.DB.Model(&rec).Update("crawl_status", "error")
		Publish(id, 100)
		return
	}

	// ---- parse HTML ----
	doc, _ := goquery.NewDocumentFromReader(resp.Body)

	internal, external, broken := 0, 0, 0
	doc.Find("a[href]").Each(func(_ int, s *goquery.Selection) {
		href, _ := s.Attr("href")
		if strings.HasPrefix(href, "http") && !strings.Contains(href, rec.OriginalURL) {
			external++
		} else {
			internal++
		}
	})

	// ---- store results & publish 100 % ----
	database.DB.Model(&rec).Updates(models.URL{
		Title:         ptr(doc.Find("title").Text()),
		InternalLinks: internal,
		ExternalLinks: external,
		BrokenLinks:   broken,
		CrawlStatus:   "done",
	})
	Publish(id, 100)
}

func ptr[T any](v T) *T { return &v }
