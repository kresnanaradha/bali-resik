// Package firebaseauth verifies Firebase ID tokens without pulling in the
// full firebase-admin-go SDK: it fetches Google's public certs and checks
// the RS256 signature plus standard claims, exactly as Firebase's own docs
// describe for backends that only need to verify tokens (not manage users).
package firebaseauth

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"errors"
	"io"
	"net/http"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const certsURL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"

type Claims struct {
	jwt.RegisteredClaims
	Email string `json:"email"`
}

type Verifier struct {
	projectID string

	mu        sync.RWMutex
	keys      map[string]*rsa.PublicKey
	expiresAt time.Time
}

func NewVerifier(projectID string) *Verifier {
	return &Verifier{projectID: projectID, keys: map[string]*rsa.PublicKey{}}
}

func (v *Verifier) Verify(idToken string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(idToken, claims, func(t *jwt.Token) (any, error) {
		kid, ok := t.Header["kid"].(string)
		if !ok {
			return nil, errors.New("header kid tidak ditemukan pada token")
		}
		return v.publicKey(kid)
	},
		jwt.WithValidMethods([]string{"RS256"}),
		jwt.WithAudience(v.projectID),
		jwt.WithIssuer("https://securetoken.google.com/"+v.projectID),
	)
	if err != nil || !token.Valid {
		return nil, errors.New("token tidak valid atau kedaluwarsa")
	}
	if claims.Subject == "" {
		return nil, errors.New("token tidak memiliki subject (uid)")
	}

	return claims, nil
}

func (v *Verifier) publicKey(kid string) (*rsa.PublicKey, error) {
	v.mu.RLock()
	key, ok := v.keys[kid]
	fresh := time.Now().Before(v.expiresAt)
	v.mu.RUnlock()

	if ok && fresh {
		return key, nil
	}

	if err := v.refreshKeys(); err != nil {
		return nil, err
	}

	v.mu.RLock()
	defer v.mu.RUnlock()
	key, ok = v.keys[kid]
	if !ok {
		return nil, errors.New("kunci publik untuk kid ini tidak ditemukan")
	}
	return key, nil
}

func (v *Verifier) refreshKeys() error {
	resp, err := http.Get(certsURL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	var raw map[string]string
	if err := json.Unmarshal(body, &raw); err != nil {
		return err
	}

	keys := make(map[string]*rsa.PublicKey, len(raw))
	for kid, certPEM := range raw {
		block, _ := pem.Decode([]byte(certPEM))
		if block == nil {
			continue
		}
		cert, err := x509.ParseCertificate(block.Bytes)
		if err != nil {
			continue
		}
		pub, ok := cert.PublicKey.(*rsa.PublicKey)
		if !ok {
			continue
		}
		keys[kid] = pub
	}

	v.mu.Lock()
	v.keys = keys
	v.expiresAt = time.Now().Add(1 * time.Hour)
	v.mu.Unlock()
	return nil
}
