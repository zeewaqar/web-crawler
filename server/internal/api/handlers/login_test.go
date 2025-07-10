package handlers_test

import (
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/zeewaqar/web-crawler/server/internal/api/handlers"
	"github.com/zeewaqar/web-crawler/server/internal/test" // <── NEW
)

func TestLoginBadCreds(t *testing.T) {
	gin.SetMode(gin.TestMode)

	test.InitInMemoryDB() // <── ensure database.DB is non-nil

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("POST", "/login",
		strings.NewReader(`{"email":"x","password":"y"}`))
	c.Request.Header.Set("Content-Type", "application/json")

	handlers.Login(c)

	if w.Code != 401 {
		t.Fatalf("got %d want 401", w.Code)
	}
}
