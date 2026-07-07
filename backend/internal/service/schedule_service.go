package service

import (
	"errors"
	"slices"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"

	"bali-resik-backend/internal/domain"
	"bali-resik-backend/internal/repository"
)

type ScheduleService struct {
	repo    *repository.ScheduleRepository
	excRepo *repository.ScheduleExceptionRepository
}

func NewScheduleService(repo *repository.ScheduleRepository, excRepo *repository.ScheduleExceptionRepository) *ScheduleService {
	return &ScheduleService{repo: repo, excRepo: excRepo}
}

type ScheduleStats struct {
	TotalJadwalAktif int64 `json:"total_jadwal_aktif"`
	JadwalHariIni    int64 `json:"jadwal_hari_ini"`
	WilayahTerlayani int64 `json:"wilayah_terlayani"`
	JadwalMendatang  int64 `json:"jadwal_mendatang"`
}

func (s *ScheduleService) Stats() (*ScheduleStats, error) {
	aktif, err := s.repo.CountByStatus(domain.ScheduleActive)
	if err != nil {
		return nil, err
	}
	hariIni, err := s.repo.CountActiveToday()
	if err != nil {
		return nil, err
	}
	wilayah, err := s.repo.CountDistinctActiveDistricts()
	if err != nil {
		return nil, err
	}
	mendatang, err := s.repo.CountByStatus(domain.ScheduleDraft)
	if err != nil {
		return nil, err
	}
	return &ScheduleStats{TotalJadwalAktif: aktif, JadwalHariIni: hariIni, WilayahTerlayani: wilayah, JadwalMendatang: mendatang}, nil
}

func (s *ScheduleService) List(page, limit int, filter repository.ScheduleFilter) ([]domain.Schedule, int64, error) {
	return s.repo.List(page, limit, filter)
}

func (s *ScheduleService) Get(id string) (*domain.Schedule, error) {
	sch, err := s.repo.FindByID(id, "TpsLocation", "District")
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return sch, err
}

type ScheduleInput struct {
	TpsLocationID string `json:"tps_location_id" validate:"required"`
	DistrictID    string `json:"district_id" validate:"required"`
	Kelurahan     string `json:"kelurahan" validate:"required"`
	WasteType     string `json:"waste_type" validate:"required"`
	DaysOfWeek    []int  `json:"days_of_week" validate:"required,min=1"`
	StartTime     string `json:"start_time" validate:"required"`
	EndTime       string `json:"end_time" validate:"required"`
}

func (s *ScheduleService) Create(in ScheduleInput) (*domain.Schedule, error) {
	sch := domain.Schedule{
		ScheduleCode:  "SCH-" + strings.ToUpper(uuid.NewString()[:6]),
		TpsLocationID: in.TpsLocationID,
		DistrictID:    in.DistrictID,
		Kelurahan:     in.Kelurahan,
		WasteType:     domain.WasteType(in.WasteType),
		DaysOfWeek:    datatypes.NewJSONSlice(in.DaysOfWeek),
		StartTime:     in.StartTime,
		EndTime:       in.EndTime,
		Status:        domain.ScheduleDraft,
	}
	if err := s.repo.Create(&sch); err != nil {
		return nil, err
	}
	return &sch, nil
}

func (s *ScheduleService) Update(id string, in ScheduleInput) (*domain.Schedule, error) {
	sch, err := s.Get(id)
	if err != nil {
		return nil, err
	}
	sch.TpsLocationID = in.TpsLocationID
	sch.DistrictID = in.DistrictID
	sch.Kelurahan = in.Kelurahan
	sch.WasteType = domain.WasteType(in.WasteType)
	sch.DaysOfWeek = datatypes.NewJSONSlice(in.DaysOfWeek)
	sch.StartTime = in.StartTime
	sch.EndTime = in.EndTime
	if err := s.repo.Update(sch); err != nil {
		return nil, err
	}
	return sch, nil
}

func (s *ScheduleService) UpdateStatus(id, status string) (*domain.Schedule, error) {
	sch, err := s.Get(id)
	if err != nil {
		return nil, err
	}
	sch.Status = domain.ScheduleStatus(status)
	if err := s.repo.Update(sch); err != nil {
		return nil, err
	}
	return sch, nil
}

func (s *ScheduleService) BulkUpdateStatus(ids []string, status string) (int, error) {
	updated := 0
	for _, id := range ids {
		if _, err := s.UpdateStatus(id, status); err != nil {
			return updated, err
		}
		updated++
	}
	return updated, nil
}

func (s *ScheduleService) Copy(id string) (*domain.Schedule, error) {
	original, err := s.Get(id)
	if err != nil {
		return nil, err
	}
	clone := domain.Schedule{
		ScheduleCode:  "SCH-" + strings.ToUpper(uuid.NewString()[:6]),
		TpsLocationID: original.TpsLocationID,
		DistrictID:    original.DistrictID,
		Kelurahan:     original.Kelurahan,
		WasteType:     original.WasteType,
		DaysOfWeek:    original.DaysOfWeek,
		StartTime:     original.StartTime,
		EndTime:       original.EndTime,
		Status:        domain.ScheduleDraft,
	}
	if err := s.repo.Create(&clone); err != nil {
		return nil, err
	}
	return &clone, nil
}

func (s *ScheduleService) Delete(id string) error {
	if _, err := s.Get(id); err != nil {
		return err
	}
	return s.repo.Delete(id)
}

type CalendarEvent struct {
	Date       string `json:"date"`
	ScheduleID string `json:"schedule_id"`
	TpsName    string `json:"tps_name"`
	WasteType  string `json:"waste_type"`
	StartTime  string `json:"start_time"`
	Status     string `json:"status"` // scheduled | cancelled | rescheduled
}

// Calendar computes, for every day in the given month, which active
// schedules occur (by weekday match) and folds in any schedule_exceptions
// override for that specific date — without mutating the recurring pattern.
func (s *ScheduleService) Calendar(year int, month time.Month) ([]CalendarEvent, error) {
	schedules, err := s.repo.ListActive()
	if err != nil {
		return nil, err
	}

	firstDay := time.Date(year, month, 1, 0, 0, 0, 0, time.UTC)
	lastDay := firstDay.AddDate(0, 1, -1)

	exceptions, err := s.excRepo.ListInRange(firstDay, lastDay)
	if err != nil {
		return nil, err
	}
	exceptionMap := make(map[string]domain.ScheduleException, len(exceptions))
	for _, ex := range exceptions {
		exceptionMap[ex.ScheduleID+"|"+ex.ExceptionDate] = ex
	}

	var events []CalendarEvent
	for d := firstDay; !d.After(lastDay); d = d.AddDate(0, 0, 1) {
		weekday := int(d.Weekday())
		dateStr := d.Format("2006-01-02")
		for _, sch := range schedules {
			if !slices.Contains([]int(sch.DaysOfWeek), weekday) {
				continue
			}
			status := "scheduled"
			if ex, ok := exceptionMap[sch.ID+"|"+dateStr]; ok {
				status = string(ex.Status)
			}
			tpsName := ""
			if sch.TpsLocation != nil {
				tpsName = sch.TpsLocation.Name
			}
			events = append(events, CalendarEvent{
				Date: dateStr, ScheduleID: sch.ID, TpsName: tpsName,
				WasteType: string(sch.WasteType), StartTime: sch.StartTime, Status: status,
			})
		}
	}
	return events, nil
}

type ExceptionInput struct {
	ExceptionDate string `json:"exception_date" validate:"required"`
	Status        string `json:"status" validate:"required,oneof=cancelled rescheduled"`
	Note          string `json:"note"`
}

func (s *ScheduleService) AddException(scheduleID string, in ExceptionInput) (*domain.ScheduleException, error) {
	if _, err := s.Get(scheduleID); err != nil {
		return nil, err
	}
	exception := domain.ScheduleException{
		ScheduleID:    scheduleID,
		ExceptionDate: in.ExceptionDate,
		Status:        domain.ScheduleExceptionStatus(in.Status),
		Note:          in.Note,
	}
	if err := s.excRepo.Create(&exception); err != nil {
		return nil, err
	}
	return &exception, nil
}

func (s *ScheduleService) RemoveException(exceptionID string) error {
	return s.excRepo.Delete(exceptionID)
}
