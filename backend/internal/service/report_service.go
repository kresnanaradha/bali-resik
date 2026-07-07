package service

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"

	"bali-resik-backend/internal/domain"
	"bali-resik-backend/internal/repository"
)

type ReportService struct {
	repo *repository.ReportRepository
}

func NewReportService(repo *repository.ReportRepository) *ReportService {
	return &ReportService{repo: repo}
}

type ReportStats struct {
	Total              int64 `json:"total"`
	MenungguVerifikasi int64 `json:"menunggu_verifikasi"`
	SedangDiproses     int64 `json:"sedang_diproses"`
	Selesai            int64 `json:"selesai"`
}

func (s *ReportService) Stats() (*ReportStats, error) {
	menunggu, err := s.repo.CountByStatus(domain.ReportMenunggu)
	if err != nil {
		return nil, err
	}
	terverifikasi, err := s.repo.CountByStatus(domain.ReportTerverifikasi)
	if err != nil {
		return nil, err
	}
	diproses, err := s.repo.CountByStatus(domain.ReportDiproses)
	if err != nil {
		return nil, err
	}
	selesai, err := s.repo.CountByStatus(domain.ReportSelesai)
	if err != nil {
		return nil, err
	}
	return &ReportStats{
		Total:              menunggu + terverifikasi + diproses + selesai,
		MenungguVerifikasi: menunggu,
		SedangDiproses:     diproses,
		Selesai:            selesai,
	}, nil
}

func (s *ReportService) List(page, limit int, filter repository.ReportFilter) ([]domain.Report, int64, error) {
	return s.repo.List(page, limit, filter)
}

func (s *ReportService) Get(id string) (*domain.Report, error) {
	report, err := s.repo.FindByID(id, "Reporter", "District", "AssignedMitra")
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return report, err
}

type CreateReportInput struct {
	ReporterID   string   `json:"reporter_id" validate:"required"`
	WasteType    string   `json:"waste_type" validate:"required"`
	Description  string   `json:"description"`
	LocationName string   `json:"location_name"`
	DistrictID   *string  `json:"district_id"`
	Latitude     float64  `json:"latitude"`
	Longitude    float64  `json:"longitude"`
	PhotoURLs    []string `json:"photo_urls"`
	Priority     string   `json:"priority" validate:"omitempty,oneof=low medium high"`
}

func (s *ReportService) Create(in CreateReportInput) (*domain.Report, error) {
	priority := domain.PriorityMedium
	if in.Priority != "" {
		priority = domain.ReportPriority(in.Priority)
	}
	report := domain.Report{
		ReportCode:   "BR-" + strings.ToUpper(uuid.NewString()[:8]),
		ReporterID:   in.ReporterID,
		WasteType:    domain.WasteType(in.WasteType),
		Description:  in.Description,
		LocationName: in.LocationName,
		DistrictID:   in.DistrictID,
		Latitude:     in.Latitude,
		Longitude:    in.Longitude,
		PhotoURLs:    datatypes.NewJSONSlice(in.PhotoURLs),
		Status:       domain.ReportMenunggu,
		Priority:     priority,
	}
	if err := s.repo.Create(&report); err != nil {
		return nil, err
	}
	return &report, nil
}

func (s *ReportService) UpdateStatus(id, status string) (*domain.Report, error) {
	report, err := s.Get(id)
	if err != nil {
		return nil, err
	}
	report.Status = domain.ReportStatus(status)
	if report.Status == domain.ReportSelesai && report.ResolvedAt == nil {
		now := time.Now()
		report.ResolvedAt = &now
	}
	if err := s.repo.Update(report); err != nil {
		return nil, err
	}
	return report, nil
}

func (s *ReportService) AssignMitra(id, mitraID string) (*domain.Report, error) {
	report, err := s.Get(id)
	if err != nil {
		return nil, err
	}
	report.AssignedMitraID = &mitraID
	if report.Status == domain.ReportMenunggu {
		report.Status = domain.ReportTerverifikasi
	}
	if err := s.repo.Update(report); err != nil {
		return nil, err
	}
	return report, nil
}

func (s *ReportService) Delete(id string) error {
	if _, err := s.Get(id); err != nil {
		return err
	}
	return s.repo.Delete(id)
}
