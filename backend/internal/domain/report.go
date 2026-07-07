package domain

import (
	"time"

	"gorm.io/datatypes"
)

type ReportStatus string

const (
	ReportMenunggu      ReportStatus = "menunggu"
	ReportTerverifikasi ReportStatus = "terverifikasi"
	ReportDiproses      ReportStatus = "diproses"
	ReportSelesai       ReportStatus = "selesai"
)

type ReportPriority string

const (
	PriorityLow    ReportPriority = "low"
	PriorityMedium ReportPriority = "medium"
	PriorityHigh   ReportPriority = "high"
)

type Report struct {
	Base
	ReportCode      string                      `gorm:"size:20;uniqueIndex;not null" json:"report_code"`
	ReporterID      string                      `gorm:"type:char(36);not null;index" json:"reporter_id"`
	Reporter        *User                       `gorm:"foreignKey:ReporterID" json:"reporter,omitempty"`
	WasteType       WasteType                   `gorm:"size:20;not null" json:"waste_type"`
	Description     string                      `gorm:"type:text" json:"description"`
	LocationName    string                      `gorm:"size:200" json:"location_name"`
	DistrictID      *string                     `gorm:"type:char(36);index" json:"district_id"`
	District        *District                   `gorm:"foreignKey:DistrictID" json:"district,omitempty"`
	Latitude        float64                     `gorm:"type:decimal(9,6)" json:"latitude"`
	Longitude       float64                     `gorm:"type:decimal(9,6)" json:"longitude"`
	PhotoURLs       datatypes.JSONSlice[string] `json:"photo_urls"`
	Status          ReportStatus                `gorm:"size:20;not null;default:menunggu;index" json:"status"`
	Priority        ReportPriority              `gorm:"size:10;not null;default:medium" json:"priority"`
	AssignedMitraID *string                     `gorm:"type:char(36)" json:"assigned_mitra_id"`
	AssignedMitra   *Mitra                      `gorm:"foreignKey:AssignedMitraID" json:"assigned_mitra,omitempty"`
	ResolvedAt      *time.Time                  `json:"resolved_at"`
}
