package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var secret []byte

func Init(sec string) { secret = []byte(sec) }

func NewToken(uid uint64) (string, error) {
	claims := jwt.MapClaims{
		"sub": uid,
		"exp": time.Now().Add(2 * time.Hour).Unix(),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).
		SignedString(secret)
}

func Parse(tokenStr string) (uint64, error) {
	tok, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
		return secret, nil
	})
	if err != nil || !tok.Valid {
		return 0, err
	}
	sub, _ := tok.Claims.(jwt.MapClaims)["sub"].(float64)
	return uint64(sub), nil
}
