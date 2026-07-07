package domain

type PointsTxType string

const (
	PointsEarn   PointsTxType = "earn"
	PointsRedeem PointsTxType = "redeem"
)

// PointsTransaction is an append-only ledger — no update/delete endpoints.
type PointsTransaction struct {
	Base
	UserID        string       `gorm:"type:char(36);not null;index" json:"user_id"`
	User          *User        `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Points        int          `gorm:"not null" json:"points"`
	Type          PointsTxType `gorm:"size:10;not null" json:"type"`
	ReferenceType string       `gorm:"size:30" json:"reference_type"`
	ReferenceID   *string      `gorm:"type:char(36)" json:"reference_id"`
	Description   string       `gorm:"type:text" json:"description"`
}
