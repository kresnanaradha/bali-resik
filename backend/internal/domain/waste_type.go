package domain

// WasteType is shared across reports, pickups, and schedules.
type WasteType string

const (
	WasteOrganik      WasteType = "organik"
	WasteAnorganik    WasteType = "anorganik"
	WastePlastik      WasteType = "plastik"
	WasteKertasKardus WasteType = "kertas_kardus"
	WasteLogam        WasteType = "logam"
	WasteBerbahaya    WasteType = "berbahaya"
	WasteCampuran     WasteType = "campuran"
	WasteLainnya      WasteType = "lainnya"
)
