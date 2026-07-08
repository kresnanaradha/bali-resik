// Package localauth issues and verifies the app's own login tokens (HS256,
// signed with JWTSecret) — independent of Firebase, since /auth/register and
// /auth/login authenticate against the users.password_hash column directly.
package localauth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type claims struct {
	jwt.RegisteredClaims
}

func IssueToken(secret, userID string, ttl time.Duration) (string, error) {
	now := time.Now()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
		},
	})
	return token.SignedString([]byte(secret))
}

// VerifyToken returns the user ID (subject) encoded in a valid token.
func VerifyToken(secret, tokenString string) (string, error) {
	c := &claims{}
	token, err := jwt.ParseWithClaims(tokenString, c, func(t *jwt.Token) (any, error) {
		return []byte(secret), nil
	}, jwt.WithValidMethods([]string{"HS256"}))
	if err != nil || !token.Valid {
		return "", errors.New("token tidak valid atau kedaluwarsa")
	}
	if c.Subject == "" {
		return "", errors.New("token tidak memiliki subject")
	}
	return c.Subject, nil
}
