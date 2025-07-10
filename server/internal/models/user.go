package models

type User struct {
	ID       uint64 `gorm:"primaryKey"`
	Email    string
	PassHash string
}
