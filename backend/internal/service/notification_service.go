package service

import (
	"errors"

	"gorm.io/gorm"

	"bali-resik-backend/internal/domain"
	"bali-resik-backend/internal/repository"
)

type NotificationService struct {
	repo *repository.NotificationRepository
}

func NewNotificationService(repo *repository.NotificationRepository) *NotificationService {
	return &NotificationService{repo: repo}
}

func (s *NotificationService) List(page, limit int, userID string, unreadOnly bool) ([]domain.Notification, int64, error) {
	return s.repo.ListByUser(page, limit, userID, unreadOnly)
}

type NotificationInput struct {
	UserID string `json:"user_id" validate:"required"`
	Title  string `json:"title" validate:"required"`
	Body   string `json:"body"`
}

func (s *NotificationService) Create(in NotificationInput) (*domain.Notification, error) {
	n := domain.Notification{UserID: in.UserID, Title: in.Title, Body: in.Body}
	if err := s.repo.Create(&n); err != nil {
		return nil, err
	}
	return &n, nil
}

func (s *NotificationService) MarkAsRead(id string) (*domain.Notification, error) {
	n, err := s.repo.FindByID(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	n.IsRead = true
	if err := s.repo.Update(n); err != nil {
		return nil, err
	}
	return n, nil
}

func (s *NotificationService) Delete(id string) error {
	return s.repo.Delete(id)
}
