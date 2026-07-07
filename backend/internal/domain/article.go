package domain

import "time"

type ArticleStatus string

const (
	ArticleDraft     ArticleStatus = "draft"
	ArticlePublished ArticleStatus = "published"
)

type Article struct {
	Base
	Title          string        `gorm:"size:200;not null" json:"title"`
	Slug           string        `gorm:"size:220;uniqueIndex;not null" json:"slug"`
	Category       string        `gorm:"size:50" json:"category"`
	Excerpt        string        `gorm:"type:text" json:"excerpt"`
	Content        string        `gorm:"type:longtext;not null" json:"content"`
	ThumbnailURL   string        `gorm:"type:text" json:"thumbnail_url"`
	AuthorID       string        `gorm:"type:char(36);not null;index" json:"author_id"`
	Author         *User         `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
	Status         ArticleStatus `gorm:"size:10;not null;default:draft;index" json:"status"`
	ViewsCount     int           `gorm:"not null;default:0" json:"views_count"`
	ChatbotIndexed bool          `gorm:"not null;default:true" json:"chatbot_indexed"`
	PublishedAt    *time.Time    `json:"published_at"`
}
