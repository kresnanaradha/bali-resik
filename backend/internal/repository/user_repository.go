package repository

import (
	"gorm.io/gorm"

	"bali-resik-backend/internal/domain"
)

type UserRepository struct {
	Base[domain.User]
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{Base: NewBase[domain.User](db)}
}

type UserFilter struct {
	Search     string
	Role       string
	DistrictID string
	Status     string
}

func (f UserFilter) scope(q *gorm.DB) *gorm.DB {
	q = q.Preload("District")
	if f.Search != "" {
		like := "%" + f.Search + "%"
		q = q.Where("full_name LIKE ? OR email LIKE ? OR phone LIKE ?", like, like, like)
	}
	if f.Role != "" {
		q = q.Where("role = ?", f.Role)
	}
	if f.DistrictID != "" {
		q = q.Where("district_id = ?", f.DistrictID)
	}
	if f.Status != "" {
		q = q.Where("status = ?", f.Status)
	}
	return q.Order("created_at DESC")
}

func (r *UserRepository) List(page, limit int, f UserFilter) ([]domain.User, int64, error) {
	return r.Base.List(page, limit, f.scope)
}

func (r *UserRepository) CountByRole(role domain.UserRole) (int64, error) {
	return r.Base.Count(func(q *gorm.DB) *gorm.DB {
		return q.Where("role = ?", role)
	})
}

func (r *UserRepository) FindByEmail(email string) (*domain.User, error) {
	var u domain.User
	if err := r.DB.Where("email = ?", email).First(&u).Error; err != nil {
		return nil, err
	}
	return &u, nil
}
