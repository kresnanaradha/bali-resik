package domain

import "time"

type MitraServiceType string

const (
	MitraServiceOnDemand MitraServiceType = "on_demand"
	MitraServiceRutin    MitraServiceType = "rutin"
)

type MitraStatus string

const (
	MitraStatusPendingVerification MitraStatus = "pending_verification"
	MitraStatusActive              MitraStatus = "active"
	MitraStatusInactive            MitraStatus = "inactive"
)

type Mitra struct {
	Base
	UserID                *string          `gorm:"type:char(36)" json:"user_id"`
	Name                  string           `gorm:"size:150;not null" json:"name"`
	ServiceAreaDistrictID *string          `gorm:"type:char(36);index" json:"service_area_district_id"`
	ServiceAreaDistrict   *District        `gorm:"foreignKey:ServiceAreaDistrictID" json:"service_area_district,omitempty"`
	ServiceType           MitraServiceType `gorm:"size:20;not null;default:on_demand" json:"service_type"`
	Phone                 string           `gorm:"size:20" json:"phone"`
	Email                 string           `gorm:"size:150" json:"email"`
	Address               string           `gorm:"type:text" json:"address"`
	RatingAvg             float64          `gorm:"type:decimal(2,1);not null;default:0" json:"rating_avg"`
	TotalTasks            int              `gorm:"not null;default:0" json:"total_tasks"`
	Status                MitraStatus      `gorm:"size:25;not null;default:pending_verification;index" json:"status"`
}

type MitraDocumentStatus string

const (
	MitraDocPending  MitraDocumentStatus = "pending"
	MitraDocVerified MitraDocumentStatus = "verified"
	MitraDocRejected MitraDocumentStatus = "rejected"
)

type MitraDocument struct {
	Base
	MitraID    string              `gorm:"type:char(36);not null;index" json:"mitra_id"`
	DocType    string              `gorm:"size:50;not null" json:"doc_type"`
	FileURL    string              `gorm:"type:text;not null" json:"file_url"`
	Status     MitraDocumentStatus `gorm:"size:20;not null;default:pending" json:"status"`
	UploadedAt time.Time           `json:"uploaded_at"`
}
