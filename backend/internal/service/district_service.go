package service

import (
	"errors"

	"gorm.io/gorm"

	"bali-resik-backend/internal/domain"
	"bali-resik-backend/internal/repository"
)

type DistrictService struct {
	repo *repository.DistrictRepository
}

func NewDistrictService(repo *repository.DistrictRepository) *DistrictService {
	return &DistrictService{repo: repo}
}

func (s *DistrictService) ListAll(search string) ([]domain.District, error) {
	return s.repo.ListAll(search)
}

func (s *DistrictService) Get(id string) (*domain.District, error) {
	d, err := s.repo.FindByID(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return d, err
}

type DistrictInput struct {
	Name          string `json:"name" validate:"required"`
	Kecamatan     string `json:"kecamatan" validate:"required"`
	KabupatenKota string `json:"kabupaten_kota" validate:"required"`
}

func (s *DistrictService) Create(in DistrictInput) (*domain.District, error) {
	d := domain.District{Name: in.Name, Kecamatan: in.Kecamatan, KabupatenKota: in.KabupatenKota}
	if err := s.repo.Create(&d); err != nil {
		return nil, err
	}
	return &d, nil
}

func (s *DistrictService) Update(id string, in DistrictInput) (*domain.District, error) {
	d, err := s.Get(id)
	if err != nil {
		return nil, err
	}
	d.Name, d.Kecamatan, d.KabupatenKota = in.Name, in.Kecamatan, in.KabupatenKota
	if err := s.repo.Update(d); err != nil {
		return nil, err
	}
	return d, nil
}

func (s *DistrictService) Delete(id string) error {
	if _, err := s.Get(id); err != nil {
		return err
	}
	return s.repo.Delete(id)
}
