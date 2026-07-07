package repository

import (
	"gorm.io/gorm"

	"bali-resik-backend/internal/domain"
)

type ReportRepository struct {
	Base[domain.Report]
}

func NewReportRepository(db *gorm.DB) *ReportRepository {
	return &ReportRepository{Base: NewBase[domain.Report](db)}
}

type ReportFilter struct {
	Search     string
	Status     string
	WasteType  string
	DistrictID string
	DateFrom   string
	DateTo     string
}

func (f ReportFilter) scope(q *gorm.DB) *gorm.DB {
	q = q.Preload("Reporter").Preload("District").Preload("AssignedMitra")
	if f.Search != "" {
		like := "%" + f.Search + "%"
		q = q.Where("report_code LIKE ? OR location_name LIKE ?", like, like)
	}
	if f.Status != "" {
		q = q.Where("status = ?", f.Status)
	}
	if f.WasteType != "" {
		q = q.Where("waste_type = ?", f.WasteType)
	}
	if f.DistrictID != "" {
		q = q.Where("district_id = ?", f.DistrictID)
	}
	if f.DateFrom != "" {
		q = q.Where("created_at >= ?", f.DateFrom)
	}
	if f.DateTo != "" {
		q = q.Where("created_at <= ?", f.DateTo)
	}
	return q.Order("created_at DESC")
}

func (r *ReportRepository) List(page, limit int, f ReportFilter) ([]domain.Report, int64, error) {
	return r.Base.List(page, limit, f.scope)
}

func (r *ReportRepository) CountByStatus(status domain.ReportStatus) (int64, error) {
	return r.Base.Count(func(q *gorm.DB) *gorm.DB { return q.Where("status = ?", status) })
}
