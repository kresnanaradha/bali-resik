package domain

type District struct {
	Base
	Name          string `gorm:"size:100;not null" json:"name"`
	Kecamatan     string `gorm:"size:100;not null" json:"kecamatan"`
	KabupatenKota string `gorm:"size:100;not null" json:"kabupaten_kota"`
}
