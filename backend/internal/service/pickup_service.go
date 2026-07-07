package service

import (
	"errors"
	"time"

	"gorm.io/gorm"

	"bali-resik-backend/internal/domain"
	"bali-resik-backend/internal/repository"
)

type PickupService struct {
	repo *repository.PickupRepository
}

func NewPickupService(repo *repository.PickupRepository) *PickupService {
	return &PickupService{repo: repo}
}

func (s *PickupService) List(page, limit int, filter repository.PickupFilter) ([]domain.Pickup, int64, error) {
	return s.repo.List(page, limit, filter)
}

func (s *PickupService) Get(id string) (*domain.Pickup, error) {
	pickup, err := s.repo.FindByID(id, "Mitra", "District")
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return pickup, err
}

type PickupInput struct {
	MitraID     string  `json:"mitra_id" validate:"required"`
	ReportID    *string `json:"report_id"`
	ScheduleID  *string `json:"schedule_id"`
	DistrictID  *string `json:"district_id"`
	WasteType   string  `json:"waste_type" validate:"required"`
	WeightKg    float64 `json:"weight_kg"`
	ScheduledAt *string `json:"scheduled_at"`
}

func (s *PickupService) Create(in PickupInput) (*domain.Pickup, error) {
	pickup := domain.Pickup{
		MitraID: in.MitraID, ReportID: in.ReportID, ScheduleID: in.ScheduleID,
		DistrictID: in.DistrictID, WasteType: domain.WasteType(in.WasteType),
		WeightKg: in.WeightKg, Status: domain.PickupScheduled,
	}
	if in.ScheduledAt != nil {
		if t, err := time.Parse(time.RFC3339, *in.ScheduledAt); err == nil {
			pickup.ScheduledAt = &t
		}
	}
	if err := s.repo.Create(&pickup); err != nil {
		return nil, err
	}
	return &pickup, nil
}

func (s *PickupService) UpdateStatus(id, status string) (*domain.Pickup, error) {
	pickup, err := s.Get(id)
	if err != nil {
		return nil, err
	}
	pickup.Status = domain.PickupStatus(status)
	if pickup.Status == domain.PickupCompleted && pickup.CompletedAt == nil {
		now := time.Now()
		pickup.CompletedAt = &now
	}
	if err := s.repo.Update(pickup); err != nil {
		return nil, err
	}
	return pickup, nil
}

func (s *PickupService) Delete(id string) error {
	if _, err := s.Get(id); err != nil {
		return err
	}
	return s.repo.Delete(id)
}
