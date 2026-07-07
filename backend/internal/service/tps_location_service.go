package service

import (
	"errors"

	"gorm.io/gorm"

	"bali-resik-backend/internal/domain"
	"bali-resik-backend/internal/repository"
)

type TpsLocationService struct {
	repo *repository.TpsLocationRepository
}

func NewTpsLocationService(repo *repository.TpsLocationRepository) *TpsLocationService {
	return &TpsLocationService{repo: repo}
}

func (s *TpsLocationService) ListAll(search, districtID string) ([]domain.TpsLocation, error) {
	return s.repo.ListAll(search, districtID)
}

func (s *TpsLocationService) Get(id string) (*domain.TpsLocation, error) {
	loc, err := s.repo.FindByID(id, "District")
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return loc, err
}

type TpsLocationInput struct {
	Name           string  `json:"name" validate:"required"`
	Address        string  `json:"address"`
	DistrictID     *string `json:"district_id"`
	Latitude       float64 `json:"latitude"`
	Longitude      float64 `json:"longitude"`
	OperatingHours string  `json:"operating_hours"`
}

func (s *TpsLocationService) Create(in TpsLocationInput) (*domain.TpsLocation, error) {
	loc := domain.TpsLocation{
		Name: in.Name, Address: in.Address, DistrictID: in.DistrictID,
		Latitude: in.Latitude, Longitude: in.Longitude, OperatingHours: in.OperatingHours,
	}
	if err := s.repo.Create(&loc); err != nil {
		return nil, err
	}
	return &loc, nil
}

func (s *TpsLocationService) Update(id string, in TpsLocationInput) (*domain.TpsLocation, error) {
	loc, err := s.Get(id)
	if err != nil {
		return nil, err
	}
	loc.Name, loc.Address, loc.DistrictID = in.Name, in.Address, in.DistrictID
	loc.Latitude, loc.Longitude, loc.OperatingHours = in.Latitude, in.Longitude, in.OperatingHours
	if err := s.repo.Update(loc); err != nil {
		return nil, err
	}
	return loc, nil
}

func (s *TpsLocationService) Delete(id string) error {
	if _, err := s.Get(id); err != nil {
		return err
	}
	return s.repo.Delete(id)
}
