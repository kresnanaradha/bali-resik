package domain

import "gorm.io/datatypes"

type ScheduleStatus string

const (
	ScheduleDraft  ScheduleStatus = "draft"
	ScheduleActive ScheduleStatus = "active"
	ScheduleClosed ScheduleStatus = "closed"
)

// Schedule represents a recurring pickup schedule. DaysOfWeek holds 0=Minggu..6=Sabtu.
// One-off cancellations/reschedules for a specific date live in ScheduleException
// instead of mutating the recurring pattern here.
type Schedule struct {
	Base
	ScheduleCode  string                   `gorm:"size:20;uniqueIndex;not null" json:"schedule_code"`
	TpsLocationID string                   `gorm:"type:char(36);not null;index" json:"tps_location_id"`
	TpsLocation   *TpsLocation             `gorm:"foreignKey:TpsLocationID" json:"tps_location,omitempty"`
	DistrictID    string                   `gorm:"type:char(36);not null;index" json:"district_id"`
	District      *District                `gorm:"foreignKey:DistrictID" json:"district,omitempty"`
	Kelurahan     string                   `gorm:"size:100;not null" json:"kelurahan"`
	WasteType     WasteType                `gorm:"size:20;not null" json:"waste_type"`
	DaysOfWeek    datatypes.JSONSlice[int] `json:"days_of_week"`
	StartTime     string                   `gorm:"type:time;not null" json:"start_time"`
	EndTime       string                   `gorm:"type:time;not null" json:"end_time"`
	Status        ScheduleStatus           `gorm:"size:10;not null;default:draft;index" json:"status"`
}

type ScheduleExceptionStatus string

const (
	ExceptionCancelled   ScheduleExceptionStatus = "cancelled"
	ExceptionRescheduled ScheduleExceptionStatus = "rescheduled"
)

type ScheduleException struct {
	Base
	ScheduleID    string                  `gorm:"type:char(36);not null;uniqueIndex:uq_schedule_exception_date" json:"schedule_id"`
	ExceptionDate string                  `gorm:"type:date;not null;uniqueIndex:uq_schedule_exception_date" json:"exception_date"`
	Status        ScheduleExceptionStatus `gorm:"size:15;not null" json:"status"`
	Note          string                  `gorm:"type:text" json:"note"`
}
