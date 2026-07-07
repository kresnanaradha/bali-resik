package repository

import (
	"gorm.io/gorm"

	"bali-resik-backend/internal/domain"
)

type PointsTransactionRepository struct {
	Base[domain.PointsTransaction]
}

func NewPointsTransactionRepository(db *gorm.DB) *PointsTransactionRepository {
	return &PointsTransactionRepository{Base: NewBase[domain.PointsTransaction](db)}
}

func (r *PointsTransactionRepository) ListByUser(page, limit int, userID string) ([]domain.PointsTransaction, int64, error) {
	return r.Base.List(page, limit, func(q *gorm.DB) *gorm.DB {
		if userID != "" {
			q = q.Where("user_id = ?", userID)
		}
		return q.Order("created_at DESC")
	})
}
