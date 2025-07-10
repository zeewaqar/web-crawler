package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/zeewaqar/web-crawler/server/internal/crawler"
)

func StopURL(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	crawler.Cancel(id)
	c.Status(http.StatusAccepted)
}
