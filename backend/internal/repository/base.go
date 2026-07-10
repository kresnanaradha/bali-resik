package repository

import (
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// Base implements the CRUD mechanics shared by every entity repository via
// Go generics, so each concrete repository only needs to add its own
// filtering/List logic instead of re-implementing Create/FindByID/Update/Delete.
type Base[T any] struct {
	DB *gorm.DB
}

func NewBase[T any](db *gorm.DB) Base[T] {
	return Base[T]{DB: db}
}

func (b Base[T]) Create(entity *T) error {
	return b.DB.Create(entity).Error
}

func (b Base[T]) FindByID(id string, preloads ...string) (*T, error) {
	var entity T
	q := b.DB
	for _, p := range preloads {
		q = q.Preload(p)
	}
	if err := q.First(&entity, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &entity, nil
}

// Update saves only the entity's own columns. Services fetch via FindByID
// with preloads before mutating, so the entity often carries a stale belongs-to
// association (e.g. an old District struct); a plain Save() would let GORM
// resync the FK from that stale association and silently revert the change.
func (b Base[T]) Update(entity *T) error {
	return b.DB.Omit(clause.Associations).Save(entity).Error
}

func (b Base[T]) Delete(id string) error {
	var entity T
	return b.DB.Delete(&entity, "id = ?", id).Error
}

// Count applies the given scopes (typically just filters) and returns the
// matching row count — handy for stat-card endpoints that don't need rows.
func (b Base[T]) Count(scopes ...func(*gorm.DB) *gorm.DB) (int64, error) {
	var total int64
	query := b.DB.Model(new(T))
	for _, s := range scopes {
		query = s(query)
	}
	err := query.Count(&total).Error
	return total, err
}

// List applies the given scopes (filters, preloads, ordering) then paginates.
// Scopes must NOT apply Limit/Offset themselves — pagination is handled here
// so Count() reflects the filtered-but-unpaginated total.
func (b Base[T]) List(page, limit int, scopes ...func(*gorm.DB) *gorm.DB) ([]T, int64, error) {
	var entities []T
	var total int64

	query := b.DB.Model(new(T))
	for _, s := range scopes {
		query = s(query)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	if err := query.Limit(limit).Offset(offset).Find(&entities).Error; err != nil {
		return nil, 0, err
	}
	return entities, total, nil
}
