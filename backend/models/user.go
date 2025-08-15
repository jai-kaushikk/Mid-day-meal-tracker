package models

import (
	"time"
)

type User struct {
    ID                int       `json:"id" gorm:"primaryKey"`
    Username          string    `json:"username" gorm:"unique"`
    Password          string    `json:"password"`
    SessionID         string    `json:"session_id"`
    IsAdmin           bool      `json:"isAdmin"`
    SessionExpiration time.Time `json:"session_expiration"`
}
