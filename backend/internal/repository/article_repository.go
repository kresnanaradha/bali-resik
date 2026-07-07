package repository

import (
	"gorm.io/gorm"

	"bali-resik-backend/internal/domain"
)

type ArticleRepository struct {
	Base[domain.Article]
}

func NewArticleRepository(db *gorm.DB) *ArticleRepository {
	return &ArticleRepository{Base: NewBase[domain.Article](db)}
}

type ArticleFilter struct {
	Search   string
	Status   string
	Category string
	AuthorID string
}

func (f ArticleFilter) scope(q *gorm.DB) *gorm.DB {
	q = q.Preload("Author")
	if f.Search != "" {
		q = q.Where("title LIKE ?", "%"+f.Search+"%")
	}
	if f.Status != "" {
		q = q.Where("status = ?", f.Status)
	}
	if f.Category != "" {
		q = q.Where("category = ?", f.Category)
	}
	if f.AuthorID != "" {
		q = q.Where("author_id = ?", f.AuthorID)
	}
	return q.Order("created_at DESC")
}

func (r *ArticleRepository) List(page, limit int, f ArticleFilter) ([]domain.Article, int64, error) {
	return r.Base.List(page, limit, f.scope)
}

func (r *ArticleRepository) CountByStatus(status domain.ArticleStatus) (int64, error) {
	return r.Base.Count(func(q *gorm.DB) *gorm.DB { return q.Where("status = ?", status) })
}

func (r *ArticleRepository) SumViews() (int64, error) {
	var total int64
	err := r.DB.Model(&domain.Article{}).Select("COALESCE(SUM(views_count), 0)").Scan(&total).Error
	return total, err
}

// PublishedForChatbot returns published + chatbot-indexed articles, consumed
// by the Bali Resik chatbot / menu Edukasi in the mobile app.
func (r *ArticleRepository) PublishedForChatbot() ([]domain.Article, error) {
	var articles []domain.Article
	err := r.DB.Where("status = ? AND chatbot_indexed = ?", domain.ArticlePublished, true).
		Order("published_at DESC").Find(&articles).Error
	return articles, err
}
