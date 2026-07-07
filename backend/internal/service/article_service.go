package service

import (
	"errors"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"bali-resik-backend/internal/domain"
	"bali-resik-backend/internal/repository"
)

type ArticleService struct {
	repo *repository.ArticleRepository
}

func NewArticleService(repo *repository.ArticleRepository) *ArticleService {
	return &ArticleService{repo: repo}
}

type ArticleStats struct {
	Total        int64 `json:"total"`
	Published    int64 `json:"published"`
	Draft        int64 `json:"draft"`
	TotalReaders int64 `json:"total_readers"`
}

func (s *ArticleService) Stats() (*ArticleStats, error) {
	published, err := s.repo.CountByStatus(domain.ArticlePublished)
	if err != nil {
		return nil, err
	}
	draft, err := s.repo.CountByStatus(domain.ArticleDraft)
	if err != nil {
		return nil, err
	}
	views, err := s.repo.SumViews()
	if err != nil {
		return nil, err
	}
	return &ArticleStats{Total: published + draft, Published: published, Draft: draft, TotalReaders: views}, nil
}

func (s *ArticleService) List(page, limit int, filter repository.ArticleFilter) ([]domain.Article, int64, error) {
	return s.repo.List(page, limit, filter)
}

func (s *ArticleService) Get(id string) (*domain.Article, error) {
	article, err := s.repo.FindByID(id, "Author")
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return article, err
}

var slugNonAlnum = regexp.MustCompile(`[^a-z0-9]+`)

func slugify(title string) string {
	slug := strings.Trim(slugNonAlnum.ReplaceAllString(strings.ToLower(title), "-"), "-")
	return slug + "-" + uuid.NewString()[:6]
}

type ArticleInput struct {
	Title          string `json:"title" validate:"required"`
	Category       string `json:"category"`
	Excerpt        string `json:"excerpt"`
	Content        string `json:"content" validate:"required"`
	ThumbnailURL   string `json:"thumbnail_url"`
	AuthorID       string `json:"author_id" validate:"required"`
	ChatbotIndexed *bool  `json:"chatbot_indexed"`
}

func (s *ArticleService) Create(in ArticleInput) (*domain.Article, error) {
	chatbotIndexed := true
	if in.ChatbotIndexed != nil {
		chatbotIndexed = *in.ChatbotIndexed
	}
	article := domain.Article{
		Title:          in.Title,
		Slug:           slugify(in.Title),
		Category:       in.Category,
		Excerpt:        in.Excerpt,
		Content:        in.Content,
		ThumbnailURL:   in.ThumbnailURL,
		AuthorID:       in.AuthorID,
		Status:         domain.ArticleDraft,
		ChatbotIndexed: chatbotIndexed,
	}
	if err := s.repo.Create(&article); err != nil {
		return nil, err
	}
	return &article, nil
}

func (s *ArticleService) Update(id string, in ArticleInput) (*domain.Article, error) {
	article, err := s.Get(id)
	if err != nil {
		return nil, err
	}
	if article.Title != in.Title {
		article.Slug = slugify(in.Title)
	}
	article.Title = in.Title
	article.Category = in.Category
	article.Excerpt = in.Excerpt
	article.Content = in.Content
	article.ThumbnailURL = in.ThumbnailURL
	if in.ChatbotIndexed != nil {
		article.ChatbotIndexed = *in.ChatbotIndexed
	}
	if err := s.repo.Update(article); err != nil {
		return nil, err
	}
	return article, nil
}

func (s *ArticleService) SetPublished(id string, published bool) (*domain.Article, error) {
	article, err := s.Get(id)
	if err != nil {
		return nil, err
	}
	if published {
		article.Status = domain.ArticlePublished
		now := time.Now()
		article.PublishedAt = &now
	} else {
		article.Status = domain.ArticleDraft
		article.PublishedAt = nil
	}
	if err := s.repo.Update(article); err != nil {
		return nil, err
	}
	return article, nil
}

func (s *ArticleService) Delete(id string) error {
	if _, err := s.Get(id); err != nil {
		return err
	}
	return s.repo.Delete(id)
}

func (s *ArticleService) ForChatbot() ([]domain.Article, error) {
	return s.repo.PublishedForChatbot()
}
