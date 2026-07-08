package repository

import (
	"strconv"
	"time"

	"gorm.io/gorm"

	"bali-resik-backend/internal/domain"
)

type ScheduleRepository struct {
	Base[domain.Schedule]
}

func NewScheduleRepository(db *gorm.DB) *ScheduleRepository {
	return &ScheduleRepository{Base: NewBase[domain.Schedule](db)}
}

type ScheduleFilter struct {
	Search        string
	DistrictID    string
	Kelurahan     string
	TpsLocationID string
	WasteType     string
	Status        string
}

func (f ScheduleFilter) scope(q *gorm.DB) *gorm.DB {
	q = q.Preload("TpsLocation").Preload("District")
	if f.Search != "" {
		// A subquery avoids joining tps_locations directly — a plain JOIN
		// makes GORM's default `SELECT *` (it doesn't auto-qualify columns)
		// pull back both tables' same-named columns (id, created_at, ...),
		// which either errors or silently corrupts the scan.
		like := "%" + f.Search + "%"
		q = q.Where(
			"schedule_code LIKE ? OR kelurahan LIKE ? OR tps_location_id IN (SELECT id FROM tps_locations WHERE name LIKE ?)",
			like, like, like,
		)
	}
	if f.DistrictID != "" {
		q = q.Where("district_id = ?", f.DistrictID)
	}
	if f.Kelurahan != "" {
		q = q.Where("kelurahan LIKE ?", "%"+f.Kelurahan+"%")
	}
	if f.TpsLocationID != "" {
		q = q.Where("tps_location_id = ?", f.TpsLocationID)
	}
	if f.WasteType != "" {
		q = q.Where("waste_type = ?", f.WasteType)
	}
	if f.Status != "" {
		q = q.Where("status = ?", f.Status)
	}
	return q.Order("created_at DESC")
}

func (r *ScheduleRepository) List(page, limit int, f ScheduleFilter) ([]domain.Schedule, int64, error) {
	return r.Base.List(page, limit, f.scope)
}

func (r *ScheduleRepository) ListActive() ([]domain.Schedule, error) {
	schedules, _, err := r.Base.List(1, 10000, ScheduleFilter{Status: string(domain.ScheduleActive)}.scope)
	return schedules, err
}

func (r *ScheduleRepository) CountByStatus(status domain.ScheduleStatus) (int64, error) {
	return r.Base.Count(func(q *gorm.DB) *gorm.DB { return q.Where("status = ?", status) })
}

// CountActiveToday counts active schedules whose days_of_week includes today.
func (r *ScheduleRepository) CountActiveToday() (int64, error) {
	weekday := int(time.Now().Weekday())
	return r.Base.Count(func(q *gorm.DB) *gorm.DB {
		return q.Where("status = ?", domain.ScheduleActive).
			Where("JSON_CONTAINS(days_of_week, ?)", strconv.Itoa(weekday))
	})
}

func (r *ScheduleRepository) CountDistinctActiveDistricts() (int64, error) {
	var count int64
	err := r.DB.Model(&domain.Schedule{}).
		Where("status = ?", domain.ScheduleActive).
		Distinct("district_id").Count(&count).Error
	return count, err
}

type ScheduleExceptionRepository struct {
	Base[domain.ScheduleException]
}

func NewScheduleExceptionRepository(db *gorm.DB) *ScheduleExceptionRepository {
	return &ScheduleExceptionRepository{Base: NewBase[domain.ScheduleException](db)}
}

func (r *ScheduleExceptionRepository) ListInRange(from, to time.Time) ([]domain.ScheduleException, error) {
	var exceptions []domain.ScheduleException
	err := r.DB.Where("exception_date BETWEEN ? AND ?", from.Format("2006-01-02"), to.Format("2006-01-02")).
		Find(&exceptions).Error
	return exceptions, err
}
