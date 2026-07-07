package domain

type Notification struct {
	Base
	UserID string `gorm:"type:char(36);not null;index" json:"user_id"`
	Title  string `gorm:"size:150;not null" json:"title"`
	Body   string `gorm:"type:text" json:"body"`
	IsRead bool   `gorm:"not null;default:false;index" json:"is_read"`
}
