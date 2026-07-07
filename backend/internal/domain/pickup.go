package domain

import "time"

type PickupStatus string

const (
	PickupScheduled  PickupStatus = "scheduled"
	PickupInProgress PickupStatus = "in_progress"
	PickupCompleted  PickupStatus = "completed"
	PickupCancelled  PickupStatus = "cancelled"
)

type Pickup struct {
	Base
	MitraID     string       `gorm:"type:char(36);not null;index" json:"mitra_id"`
	Mitra       *Mitra       `gorm:"foreignKey:MitraID" json:"mitra,omitempty"`
	ReportID    *string      `gorm:"type:char(36)" json:"report_id"`
	ScheduleID  *string      `gorm:"type:char(36)" json:"schedule_id"`
	DistrictID  *string      `gorm:"type:char(36);index" json:"district_id"`
	District    *District    `gorm:"foreignKey:DistrictID" json:"district,omitempty"`
	WasteType   WasteType    `gorm:"size:20;not null" json:"waste_type"`
	WeightKg    float64      `gorm:"type:decimal(10,2)" json:"weight_kg"`
	Status      PickupStatus `gorm:"size:20;not null;default:scheduled;index" json:"status"`
	ScheduledAt *time.Time   `json:"scheduled_at"`
	CompletedAt *time.Time   `json:"completed_at"`
}
