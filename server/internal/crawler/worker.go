package crawler

import (
	"context"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/zeewaqar/web-crawler/server/internal/database"
	"github.com/zeewaqar/web-crawler/server/internal/models"
)

var client = &http.Client{Timeout: 10 * time.Second}

/*───────────────── Worker loop ─────────────────*/

func Worker(jobs <-chan uint64) {
	for id := range jobs {
		crawl(id)
	}
}

/*───────────────── crawl one URL ───────────────*/

func crawl(id uint64) {
	ctx, cancel := context.WithTimeout(context.Background(), 45*time.Second)
	defer cancel()

	/* 1. fetch db record */
	var rec models.URL
	if err := database.DB.First(&rec, id).Error; err != nil {
		return
	}

	/* 2. mark running & reset stats */
	database.DB.Model(&rec).Updates(map[string]any{
		"crawl_status":   "running",
		"internal_links": 0, "external_links": 0, "broken_links": 0,
		"h1": 0, "h2": 0, "h3": 0,
		"has_login": false,
	})
	Publish(id, 0)

	/* 3. download page */
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, rec.OriginalURL, nil)
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode >= 400 {
		fail(rec.ID)
		return
	}
	defer resp.Body.Close()

	if !strings.Contains(resp.Header.Get("Content-Type"), "text/html") {
		fail(rec.ID)
		return
	}

	doc, _ := goquery.NewDocumentFromReader(resp.Body)

	/* 4. headings */
	h1 := doc.Find("h1").Length()
	h2 := doc.Find("h2").Length()
	h3 := doc.Find("h3").Length()
	Publish(id, 10)

	/* 5. login form */
	hasLogin := doc.Find("form").FilterFunction(func(_ int, f *goquery.Selection) bool {
		return f.Find(`input[type="password"]`).Length() > 0
	}).Length() > 0
	Publish(id, 15)

	/* 6. link extraction & status check */
	pageHost := host(rec.OriginalURL)

	internal, external, broken := 0, 0, 0
	var linkRows []models.Link

	links := doc.Find("a[href]")
	totalSteps := links.Length() + 18 // 18% done so far (15 + 3 final updates)

	links.Each(func(i int, s *goquery.Selection) {
		href, _ := s.Attr("href")
		href = strings.TrimSpace(href)
		if href == "" || strings.HasPrefix(href, "#") {
			return
		}

		abs := absolute(rec.OriginalURL, href)
		isInt := host(abs) == pageHost
		if isInt {
			internal++
		} else {
			external++
		}

		st := headStatus(ctx, abs)
		if st >= 400 {
			broken++
		}

		linkRows = append(linkRows, models.Link{
			URLID:      rec.ID,
			Href:       abs,
			HTTPStatus: &st,
			IsInternal: isInt,
		})

		Publish(id, percent(i+16, totalSteps))
	})

	/* replace old link rows */
	database.DB.Where("url_id = ?", rec.ID).Delete(&models.Link{})
	if len(linkRows) > 0 {
		database.DB.Create(&linkRows)
	}

	/* 7. final update */
	database.DB.Model(&rec).Updates(models.URL{
		Title: ptr(doc.Find("title").Text()),
		H1:    h1, H2: h2, H3: h3,
		InternalLinks: internal,
		ExternalLinks: external,
		BrokenLinks:   broken,
		HasLogin:      hasLogin,
		CrawlStatus:   "done",
	})
	Publish(id, 100)
}

/*───────────────── helpers ─────────────────────*/

func headStatus(ctx context.Context, u string) int {
	req, _ := http.NewRequestWithContext(ctx, http.MethodHead, u, nil)
	res, err := client.Do(req)
	if err != nil {
		return 0
	}
	res.Body.Close()
	return res.StatusCode
}

func absolute(base, href string) string {
	u, err := url.Parse(href)
	if err != nil || u.IsAbs() {
		return href
	}
	baseURL, _ := url.Parse(base)
	return baseURL.ResolveReference(u).String()
}

func host(u string) string {
	parsed, _ := url.Parse(u)
	return parsed.Hostname()
}

func percent(done, total int) int {
	if total == 0 {
		return 100
	}
	return int(float64(done) / float64(total) * 100)
}

func fail(id uint64) {
	database.DB.Model(&models.URL{}).Where("id = ?", id).Update("crawl_status", "error")
	Publish(id, 100)
}

func ptr[T any](v T) *T { return &v }
