package repository

import (
	"gorm.io/gorm"

	"bali-resik-backend/internal/domain"
)

type NotificationRepository struct {
	Base[domain.Notification]
}

func NewNotificationRepository(db *gorm.DB) *NotificationRepository {
	return &NotificationRepository{Base: NewBase[domain.Notification](db)}
}

func (r *NotificationRepository) ListByUser(page, limit int, userID string, unreadOnly bool) ([]domain.Notification, int64, error) {
	return r.Base.List(page, limit, func(q *gorm.DB) *gorm.DB {
		q = q.Where("user_id = ?", userID)
		if unreadOnly {
			q = q.Where("is_read = ?", false)
		}
		return q.Order("created_at DESC")
	})
}
