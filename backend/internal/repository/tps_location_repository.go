package repository

import (
	"gorm.io/gorm"

	"bali-resik-backend/internal/domain"
)

type TpsLocationRepository struct {
	Base[domain.TpsLocation]
}

func NewTpsLocationRepository(db *gorm.DB) *TpsLocationRepository {
	return &TpsLocationRepository{Base: NewBase[domain.TpsLocation](db)}
}

func (r *TpsLocationRepository) ListAll(search, districtID string) ([]domain.TpsLocation, error) {
	var locations []domain.TpsLocation
	q := r.DB.Preload("District").Order("name ASC")
	if search != "" {
		q = q.Where("name LIKE ? OR address LIKE ?", "%"+search+"%", "%"+search+"%")
	}
	if districtID != "" {
		q = q.Where("district_id = ?", districtID)
	}
	err := q.Find(&locations).Error
	return locations, err
}
