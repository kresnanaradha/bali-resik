package repository

import (
	"gorm.io/gorm"

	"bali-resik-backend/internal/domain"
)

type PickupRepository struct {
	Base[domain.Pickup]
}

func NewPickupRepository(db *gorm.DB) *PickupRepository {
	return &PickupRepository{Base: NewBase[domain.Pickup](db)}
}

type PickupFilter struct {
	MitraID    string
	DistrictID string
	Status     string
}

func (f PickupFilter) scope(q *gorm.DB) *gorm.DB {
	q = q.Preload("Mitra").Preload("District")
	if f.MitraID != "" {
		q = q.Where("mitra_id = ?", f.MitraID)
	}
	if f.DistrictID != "" {
		q = q.Where("district_id = ?", f.DistrictID)
	}
	if f.Status != "" {
		q = q.Where("status = ?", f.Status)
	}
	return q.Order("created_at DESC")
}

func (r *PickupRepository) List(page, limit int, f PickupFilter) ([]domain.Pickup, int64, error) {
	return r.Base.List(page, limit, f.scope)
}

func (r *PickupRepository) CountByStatus(status domain.PickupStatus) (int64, error) {
	return r.Base.Count(func(q *gorm.DB) *gorm.DB { return q.Where("status = ?", status) })
}
