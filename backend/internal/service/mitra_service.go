package service

import (
	"errors"

	"gorm.io/gorm"

	"bali-resik-backend/internal/domain"
	"bali-resik-backend/internal/repository"
)

type MitraService struct {
	repo    *repository.MitraRepository
	docRepo *repository.MitraDocumentRepository
}

func NewMitraService(repo *repository.MitraRepository, docRepo *repository.MitraDocumentRepository) *MitraService {
	return &MitraService{repo: repo, docRepo: docRepo}
}

type MitraStats struct {
	Total          int64 `json:"total"`
	Aktif          int64 `json:"aktif"`
	TidakAktif     int64 `json:"tidak_aktif"`
	VerifikasiBaru int64 `json:"verifikasi_baru"`
}

func (s *MitraService) Stats() (*MitraStats, error) {
	aktif, err := s.repo.CountByStatus(domain.MitraStatusActive)
	if err != nil {
		return nil, err
	}
	tidakAktif, err := s.repo.CountByStatus(domain.MitraStatusInactive)
	if err != nil {
		return nil, err
	}
	pending, err := s.repo.CountByStatus(domain.MitraStatusPendingVerification)
	if err != nil {
		return nil, err
	}
	return &MitraStats{
		Total:          aktif + tidakAktif + pending,
		Aktif:          aktif,
		TidakAktif:     tidakAktif,
		VerifikasiBaru: pending,
	}, nil
}

func (s *MitraService) List(page, limit int, filter repository.MitraFilter) ([]domain.Mitra, int64, error) {
	return s.repo.List(page, limit, filter)
}

func (s *MitraService) Get(id string) (*domain.Mitra, error) {
	mitra, err := s.repo.FindByID(id, "ServiceAreaDistrict")
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return mitra, err
}

type MitraInput struct {
	UserID                *string `json:"user_id"`
	Name                  string  `json:"name" validate:"required"`
	ServiceAreaDistrictID *string `json:"service_area_district_id"`
	ServiceType           string  `json:"service_type" validate:"required,oneof=on_demand rutin"`
	Phone                 string  `json:"phone"`
	Email                 string  `json:"email" validate:"omitempty,email"`
	Address               string  `json:"address"`
}

func (s *MitraService) Create(in MitraInput) (*domain.Mitra, error) {
	mitra := domain.Mitra{
		UserID:                in.UserID,
		Name:                  in.Name,
		ServiceAreaDistrictID: in.ServiceAreaDistrictID,
		ServiceType:           domain.MitraServiceType(in.ServiceType),
		Phone:                 in.Phone,
		Email:                 in.Email,
		Address:               in.Address,
		Status:                domain.MitraStatusPendingVerification,
	}
	if err := s.repo.Create(&mitra); err != nil {
		return nil, err
	}
	return &mitra, nil
}

type UpdateMitraInput struct {
	Name                  *string `json:"name"`
	ServiceAreaDistrictID *string `json:"service_area_district_id"`
	ServiceType           *string `json:"service_type" validate:"omitempty,oneof=on_demand rutin"`
	Phone                 *string `json:"phone"`
	Email                 *string `json:"email" validate:"omitempty,email"`
	Address               *string `json:"address"`
}

func (s *MitraService) Update(id string, in UpdateMitraInput) (*domain.Mitra, error) {
	mitra, err := s.Get(id)
	if err != nil {
		return nil, err
	}
	if in.Name != nil {
		mitra.Name = *in.Name
	}
	if in.ServiceAreaDistrictID != nil {
		mitra.ServiceAreaDistrictID = in.ServiceAreaDistrictID
	}
	if in.ServiceType != nil {
		mitra.ServiceType = domain.MitraServiceType(*in.ServiceType)
	}
	if in.Phone != nil {
		mitra.Phone = *in.Phone
	}
	if in.Email != nil {
		mitra.Email = *in.Email
	}
	if in.Address != nil {
		mitra.Address = *in.Address
	}
	if err := s.repo.Update(mitra); err != nil {
		return nil, err
	}
	return mitra, nil
}

func (s *MitraService) UpdateStatus(id string, status string) (*domain.Mitra, error) {
	mitra, err := s.Get(id)
	if err != nil {
		return nil, err
	}
	mitra.Status = domain.MitraStatus(status)
	if err := s.repo.Update(mitra); err != nil {
		return nil, err
	}
	return mitra, nil
}

func (s *MitraService) Delete(id string) error {
	if _, err := s.Get(id); err != nil {
		return err
	}
	return s.repo.Delete(id)
}

func (s *MitraService) ListDocuments(mitraID string) ([]domain.MitraDocument, error) {
	return s.docRepo.ListByMitra(mitraID)
}

func (s *MitraService) UpdateDocumentStatus(mitraID, docID, status string) (*domain.MitraDocument, error) {
	doc, err := s.docRepo.FindByID(docID)
	if errors.Is(err, gorm.ErrRecordNotFound) || (err == nil && doc.MitraID != mitraID) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	doc.Status = domain.MitraDocumentStatus(status)
	if err := s.docRepo.Update(doc); err != nil {
		return nil, err
	}
	return doc, nil
}
