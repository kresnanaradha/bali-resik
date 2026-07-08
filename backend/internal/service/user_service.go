package service

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"bali-resik-backend/internal/domain"
	"bali-resik-backend/internal/repository"
)

var ErrNotFound = errors.New("data tidak ditemukan")

type UserService struct {
	repo *repository.UserRepository
}

func NewUserService(repo *repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}

type UserStats struct {
	Total int64 `json:"total"`
	Warga int64 `json:"warga"`
	Mitra int64 `json:"mitra"`
	Admin int64 `json:"admin"`
}

func (s *UserService) Stats() (*UserStats, error) {
	warga, err := s.repo.CountByRole(domain.RoleWarga)
	if err != nil {
		return nil, err
	}
	mitra, err := s.repo.CountByRole(domain.RoleMitra)
	if err != nil {
		return nil, err
	}
	admin, err := s.repo.CountByRole(domain.RoleAdmin)
	if err != nil {
		return nil, err
	}
	return &UserStats{Total: warga + mitra + admin, Warga: warga, Mitra: mitra, Admin: admin}, nil
}

func (s *UserService) List(page, limit int, filter repository.UserFilter) ([]domain.User, int64, error) {
	return s.repo.List(page, limit, filter)
}

func (s *UserService) Get(id string) (*domain.User, error) {
	user, err := s.repo.FindByID(id, "District")
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return user, err
}

type CreateUserInput struct {
	FirebaseUID string  `json:"firebase_uid"`
	FullName    string  `json:"full_name" validate:"required"`
	Email       string  `json:"email" validate:"required,email"`
	Phone       string  `json:"phone"`
	Role        string  `json:"role" validate:"required,oneof=warga mitra admin"`
	DistrictID  *string `json:"district_id"`
	AvatarURL   string  `json:"avatar_url"`
}

func (s *UserService) Create(in CreateUserInput) (*domain.User, error) {
	firebaseUID := in.FirebaseUID
	if firebaseUID == "" {
		// Akun dibuat admin dari portal ini belum tentu punya akun Firebase
		// sendiri (mis. warga/mitra didaftarkan manual) — pakai placeholder
		// unik supaya kolom firebase_uid tetap NOT NULL UNIQUE, dan bisa
		// ditautkan ke Firebase UID asli nanti saat pengguna login pertama kali.
		firebaseUID = "local:" + uuid.NewString()
	}

	user := domain.User{
		FirebaseUID: firebaseUID,
		FullName:    in.FullName,
		Email:       in.Email,
		Phone:       in.Phone,
		Role:        domain.UserRole(in.Role),
		DistrictID:  in.DistrictID,
		AvatarURL:   in.AvatarURL,
		Status:      domain.UserStatusActive,
		JoinedAt:    time.Now(),
	}
	if err := s.repo.Create(&user); err != nil {
		return nil, err
	}
	return &user, nil
}

type UpdateUserInput struct {
	FullName   *string `json:"full_name"`
	Phone      *string `json:"phone"`
	Role       *string `json:"role" validate:"omitempty,oneof=warga mitra admin"`
	DistrictID *string `json:"district_id"`
	AvatarURL  *string `json:"avatar_url"`
	Status     *string `json:"status" validate:"omitempty,oneof=active inactive suspended"`
}

func (s *UserService) Update(id string, in UpdateUserInput) (*domain.User, error) {
	user, err := s.Get(id)
	if err != nil {
		return nil, err
	}

	if in.FullName != nil {
		user.FullName = *in.FullName
	}
	if in.Phone != nil {
		user.Phone = *in.Phone
	}
	if in.Role != nil {
		user.Role = domain.UserRole(*in.Role)
	}
	if in.DistrictID != nil {
		user.DistrictID = in.DistrictID
	}
	if in.AvatarURL != nil {
		user.AvatarURL = *in.AvatarURL
	}
	if in.Status != nil {
		user.Status = domain.UserStatus(*in.Status)
	}

	if err := s.repo.Update(user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *UserService) UpdateStatus(id string, status string) (*domain.User, error) {
	return s.Update(id, UpdateUserInput{Status: &status})
}

func (s *UserService) Delete(id string) error {
	if _, err := s.Get(id); err != nil {
		return err
	}
	return s.repo.Delete(id)
}

func (s *UserService) SetPassword(id, newPassword string) error {
	user, err := s.Get(id)
	if err != nil {
		return err
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.PasswordHash = string(hash)
	return s.repo.Update(user)
}
