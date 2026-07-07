package repository

import (
	"gorm.io/gorm"

	"bali-resik-backend/internal/domain"
)

type MitraRepository struct {
	Base[domain.Mitra]
}

func NewMitraRepository(db *gorm.DB) *MitraRepository {
	return &MitraRepository{Base: NewBase[domain.Mitra](db)}
}

type MitraFilter struct {
	Search string
	Status string
}

func (f MitraFilter) scope(q *gorm.DB) *gorm.DB {
	q = q.Preload("ServiceAreaDistrict")
	if f.Search != "" {
		like := "%" + f.Search + "%"
		q = q.Where("name LIKE ? OR email LIKE ? OR phone LIKE ?", like, like, like)
	}
	if f.Status != "" {
		q = q.Where("status = ?", f.Status)
	}
	return q.Order("created_at DESC")
}

func (r *MitraRepository) List(page, limit int, f MitraFilter) ([]domain.Mitra, int64, error) {
	return r.Base.List(page, limit, f.scope)
}

func (r *MitraRepository) CountByStatus(status domain.MitraStatus) (int64, error) {
	return r.Base.Count(func(q *gorm.DB) *gorm.DB {
		return q.Where("status = ?", status)
	})
}

type MitraDocumentRepository struct {
	Base[domain.MitraDocument]
}

func NewMitraDocumentRepository(db *gorm.DB) *MitraDocumentRepository {
	return &MitraDocumentRepository{Base: NewBase[domain.MitraDocument](db)}
}

func (r *MitraDocumentRepository) ListByMitra(mitraID string) ([]domain.MitraDocument, error) {
	var docs []domain.MitraDocument
	err := r.DB.Where("mitra_id = ?", mitraID).Order("uploaded_at DESC").Find(&docs).Error
	return docs, err
}
