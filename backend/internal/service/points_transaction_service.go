package service

import (
	"bali-resik-backend/internal/domain"
	"bali-resik-backend/internal/repository"
)

type PointsTransactionService struct {
	repo *repository.PointsTransactionRepository
}

func NewPointsTransactionService(repo *repository.PointsTransactionRepository) *PointsTransactionService {
	return &PointsTransactionService{repo: repo}
}

func (s *PointsTransactionService) List(page, limit int, userID string) ([]domain.PointsTransaction, int64, error) {
	return s.repo.ListByUser(page, limit, userID)
}

type PointsTransactionInput struct {
	UserID        string  `json:"user_id" validate:"required"`
	Points        int     `json:"points" validate:"required"`
	Type          string  `json:"type" validate:"required,oneof=earn redeem"`
	ReferenceType string  `json:"reference_type"`
	ReferenceID   *string `json:"reference_id"`
	Description   string  `json:"description"`
}

func (s *PointsTransactionService) Create(in PointsTransactionInput) (*domain.PointsTransaction, error) {
	tx := domain.PointsTransaction{
		UserID: in.UserID, Points: in.Points, Type: domain.PointsTxType(in.Type),
		ReferenceType: in.ReferenceType, ReferenceID: in.ReferenceID, Description: in.Description,
	}
	if err := s.repo.Create(&tx); err != nil {
		return nil, err
	}
	return &tx, nil
}
