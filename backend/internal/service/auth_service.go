package service

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"bali-resik-backend/internal/domain"
	"bali-resik-backend/internal/middleware/localauth"
	"bali-resik-backend/internal/repository"
)

var (
	ErrInvalidCredentials = errors.New("email atau password salah")
	ErrEmailTaken         = errors.New("email sudah terdaftar")
)

const sessionTTL = 7 * 24 * time.Hour

type AuthService struct {
	repo      *repository.UserRepository
	jwtSecret string
}

func NewAuthService(repo *repository.UserRepository, jwtSecret string) *AuthService {
	return &AuthService{repo: repo, jwtSecret: jwtSecret}
}

type RegisterInput struct {
	FullName string `json:"full_name" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

// Register always creates an admin account — this portal has no non-admin
// login surface, so a self-registered user must be able to pass RequireAdmin.
func (s *AuthService) Register(in RegisterInput) (*domain.User, string, error) {
	if _, err := s.repo.FindByEmail(in.Email); err == nil {
		return nil, "", ErrEmailTaken
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", err
	}
	user := domain.User{
		FirebaseUID:  "local:" + uuid.NewString(),
		FullName:     in.FullName,
		Email:        in.Email,
		Role:         domain.RoleAdmin,
		Status:       domain.UserStatusActive,
		PasswordHash: string(hash),
	}
	if err := s.repo.Create(&user); err != nil {
		return nil, "", err
	}
	token, err := localauth.IssueToken(s.jwtSecret, user.ID, sessionTTL)
	if err != nil {
		return nil, "", err
	}
	return &user, token, nil
}

type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

func (s *AuthService) Login(in LoginInput) (*domain.User, string, error) {
	user, err := s.repo.FindByEmail(in.Email)
	if err != nil || user.PasswordHash == "" {
		return nil, "", ErrInvalidCredentials
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(in.Password)); err != nil {
		return nil, "", ErrInvalidCredentials
	}
	token, err := localauth.IssueToken(s.jwtSecret, user.ID, sessionTTL)
	if err != nil {
		return nil, "", err
	}
	return user, token, nil
}
