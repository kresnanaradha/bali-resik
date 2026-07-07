package domain

import (
	"time"

	"gorm.io/gorm"
)

type UserRole string

const (
	RoleWarga UserRole = "warga"
	RoleMitra UserRole = "mitra"
	RoleAdmin UserRole = "admin"
)

type UserStatus string

const (
	UserStatusActive    UserStatus = "active"
	UserStatusInactive  UserStatus = "inactive"
	UserStatusSuspended UserStatus = "suspended"
)

type User struct {
	Base
	FirebaseUID string     `gorm:"size:128;uniqueIndex;not null" json:"firebase_uid"`
	FullName    string     `gorm:"size:150;not null" json:"full_name"`
	Email       string     `gorm:"size:150;uniqueIndex;not null" json:"email"`
	Phone       string     `gorm:"size:20" json:"phone"`
	Role        UserRole   `gorm:"size:20;not null;default:warga;index" json:"role"`
	DistrictID  *string    `gorm:"type:char(36);index" json:"district_id"`
	District    *District  `gorm:"foreignKey:DistrictID" json:"district,omitempty"`
	AvatarURL   string     `gorm:"type:text" json:"avatar_url"`
	Status      UserStatus `gorm:"size:20;not null;default:active" json:"status"`
	JoinedAt    time.Time  `json:"joined_at"`
}

// BeforeCreate shadows Base.BeforeCreate (Go method resolution picks the
// directly-defined one over the promoted one), so it must call through to
// Base explicitly for UUID generation. It also defaults JoinedAt — MySQL's
// DATETIME rejects Go's zero time.Time (year 1) under strict mode, and it's
// easy for a call site to forget to set JoinedAt explicitly.
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if err := u.Base.BeforeCreate(tx); err != nil {
		return err
	}
	if u.JoinedAt.IsZero() {
		u.JoinedAt = time.Now()
	}
	return nil
}
