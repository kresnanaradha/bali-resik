package repository

import (
	"gorm.io/gorm"

	"bali-resik-backend/internal/domain"
)

type DistrictRepository struct {
	Base[domain.District]
}

func NewDistrictRepository(db *gorm.DB) *DistrictRepository {
	return &DistrictRepository{Base: NewBase[domain.District](db)}
}

func (r *DistrictRepository) ListAll(search string) ([]domain.District, error) {
	var districts []domain.District
	q := r.DB.Order("name ASC")
	if search != "" {
		q = q.Where("name LIKE ? OR kecamatan LIKE ?", "%"+search+"%", "%"+search+"%")
	}
	err := q.Find(&districts).Error
	return districts, err
}
