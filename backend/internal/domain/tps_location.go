package domain

type TpsLocation struct {
	Base
	Name           string    `gorm:"size:150;not null" json:"name"`
	Address        string    `gorm:"type:text" json:"address"`
	DistrictID     *string   `gorm:"type:char(36);index" json:"district_id"`
	District       *District `gorm:"foreignKey:DistrictID" json:"district,omitempty"`
	Latitude       float64   `gorm:"type:decimal(9,6)" json:"latitude"`
	Longitude      float64   `gorm:"type:decimal(9,6)" json:"longitude"`
	OperatingHours string    `gorm:"size:100" json:"operating_hours"`
}
