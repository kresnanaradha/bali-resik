package service

import (
	"math"
	"time"

	"gorm.io/gorm"

	"bali-resik-backend/internal/domain"
)

type AnalyticsService struct {
	db *gorm.DB
}

func NewAnalyticsService(db *gorm.DB) *AnalyticsService {
	return &AnalyticsService{db: db}
}

func round2(v float64) float64 {
	return math.Round(v*100) / 100
}

func pctChange(curr, prev float64) float64 {
	if prev == 0 {
		if curr == 0 {
			return 0
		}
		return 100
	}
	return round2(((curr - prev) / prev) * 100)
}

type OverviewStats struct {
	TotalPenjemputan         int64   `json:"total_penjemputan"`
	TotalPenjemputanTrendPct float64 `json:"total_penjemputan_trend_pct"`
	SampahTerkumpulTon       float64 `json:"sampah_terkumpul_ton"`
	SampahTerkumpulTrendPct  float64 `json:"sampah_terkumpul_trend_pct"`
	TingkatPenyelesaian      float64 `json:"tingkat_penyelesaian"`
	TargetTon                float64 `json:"target_ton"`
	PertumbuhanPengguna      int64   `json:"pertumbuhan_pengguna"`
	PertumbuhanDelta         int64   `json:"pertumbuhan_delta"`
}

const analyticsTargetTon = 500.0

func (s *AnalyticsService) Overview(days int) (*OverviewStats, error) {
	now := time.Now()
	currentStart := now.AddDate(0, 0, -days)
	prevStart := now.AddDate(0, 0, -2*days)

	var totalCurrent, totalPrev, completedCount int64
	s.db.Model(&domain.Pickup{}).Where("created_at >= ?", currentStart).Count(&totalCurrent)
	s.db.Model(&domain.Pickup{}).Where("created_at >= ? AND created_at < ?", prevStart, currentStart).Count(&totalPrev)
	s.db.Model(&domain.Pickup{}).Where("created_at >= ? AND status = ?", currentStart, domain.PickupCompleted).Count(&completedCount)

	var sumCurrent, sumPrev float64
	s.db.Model(&domain.Pickup{}).Where("created_at >= ? AND status = ?", currentStart, domain.PickupCompleted).
		Select("COALESCE(SUM(weight_kg),0)").Scan(&sumCurrent)
	s.db.Model(&domain.Pickup{}).Where("created_at >= ? AND created_at < ? AND status = ?", prevStart, currentStart, domain.PickupCompleted).
		Select("COALESCE(SUM(weight_kg),0)").Scan(&sumPrev)

	var wargaTotal, wargaNew int64
	s.db.Model(&domain.User{}).Where("role = ?", domain.RoleWarga).Count(&wargaTotal)
	s.db.Model(&domain.User{}).Where("role = ? AND created_at >= ?", domain.RoleWarga, currentStart).Count(&wargaNew)

	completionRate := 0.0
	if totalCurrent > 0 {
		completionRate = round2(float64(completedCount) / float64(totalCurrent) * 100)
	}

	return &OverviewStats{
		TotalPenjemputan:         totalCurrent,
		TotalPenjemputanTrendPct: pctChange(float64(totalCurrent), float64(totalPrev)),
		SampahTerkumpulTon:       round2(sumCurrent / 1000),
		SampahTerkumpulTrendPct:  pctChange(sumCurrent, sumPrev),
		TingkatPenyelesaian:      completionRate,
		TargetTon:                analyticsTargetTon,
		PertumbuhanPengguna:      wargaTotal,
		PertumbuhanDelta:         wargaNew,
	}, nil
}

type WeeklyTrendPoint struct {
	Day       string  `json:"day"`
	Organik   float64 `json:"organik"`
	Anorganik float64 `json:"anorganik"`
}

var weekdayLabels = []struct {
	Dow   int
	Label string
}{
	{2, "SEN"}, {3, "SEL"}, {4, "RAB"}, {5, "KAM"}, {6, "JUM"}, {7, "SAB"}, {1, "MIN"},
}

func (s *AnalyticsService) WeeklyTrend(days int) ([]WeeklyTrendPoint, error) {
	since := time.Now().AddDate(0, 0, -days)

	type row struct {
		Dow         int
		WasteBucket string
		TotalKg     float64
	}
	var rows []row
	err := s.db.Raw(`
		SELECT DAYOFWEEK(created_at) AS dow,
		       CASE WHEN waste_type = 'organik' THEN 'organik' ELSE 'anorganik' END AS waste_bucket,
		       COALESCE(SUM(weight_kg), 0) AS total_kg
		FROM pickups
		WHERE created_at >= ?
		GROUP BY dow, waste_bucket
	`, since).Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	byDow := make(map[int]*WeeklyTrendPoint)
	for _, w := range weekdayLabels {
		byDow[w.Dow] = &WeeklyTrendPoint{Day: w.Label}
	}
	for _, r := range rows {
		point, ok := byDow[r.Dow]
		if !ok {
			continue
		}
		if r.WasteBucket == "organik" {
			point.Organik = round2(r.TotalKg)
		} else {
			point.Anorganik = round2(r.TotalKg)
		}
	}

	result := make([]WeeklyTrendPoint, len(weekdayLabels))
	for i, w := range weekdayLabels {
		result[i] = *byDow[w.Dow]
	}
	return result, nil
}

type WasteDistributionSlice struct {
	Name string  `json:"name"`
	Pct  float64 `json:"pct"`
}

var wasteTypeLabels = map[string]string{
	"plastik":       "Plastik",
	"organik":       "Organik",
	"anorganik":     "Anorganik",
	"kertas_kardus": "Kertas/Kardus",
	"logam":         "Logam",
	"berbahaya":     "Berbahaya",
	"campuran":      "Campuran",
	"lainnya":       "Lainnya",
}

func (s *AnalyticsService) WasteDistribution(days int) ([]WasteDistributionSlice, error) {
	since := time.Now().AddDate(0, 0, -days)

	type row struct {
		WasteType string
		Cnt       int64
	}
	var rows []row
	if err := s.db.Raw(`
		SELECT waste_type, COUNT(*) AS cnt
		FROM pickups
		WHERE created_at >= ?
		GROUP BY waste_type
	`, since).Scan(&rows).Error; err != nil {
		return nil, err
	}

	var total int64
	for _, r := range rows {
		total += r.Cnt
	}
	if total == 0 {
		return []WasteDistributionSlice{}, nil
	}

	result := make([]WasteDistributionSlice, 0, len(rows))
	for _, r := range rows {
		label := wasteTypeLabels[r.WasteType]
		if label == "" {
			label = r.WasteType
		}
		result = append(result, WasteDistributionSlice{
			Name: label,
			Pct:  round2(float64(r.Cnt) / float64(total) * 100),
		})
	}
	return result, nil
}

type MitraPerformanceRow struct {
	Name        string  `json:"name"`
	TonPerBulan float64 `json:"ton_per_bulan"`
}

func (s *AnalyticsService) MitraPerformance(days, limit int) ([]MitraPerformanceRow, error) {
	since := time.Now().AddDate(0, 0, -days)
	var rows []MitraPerformanceRow
	err := s.db.Raw(`
		SELECT mitra.name AS name, COALESCE(SUM(pickups.weight_kg), 0) / 1000 AS ton_per_bulan
		FROM pickups
		JOIN mitra ON pickups.mitra_id = mitra.id
		WHERE pickups.created_at >= ? AND pickups.status = 'completed'
		GROUP BY mitra.id, mitra.name
		ORDER BY ton_per_bulan DESC
		LIMIT ?
	`, since, limit).Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	for i := range rows {
		rows[i].TonPerBulan = round2(rows[i].TonPerBulan)
	}
	return rows, nil
}

type DistrictReportRow struct {
	District   string  `json:"district"`
	Households int64   `json:"households"`
	VolumeTon  float64 `json:"volume_ton"`
	Status     string  `json:"status"`
}

func (s *AnalyticsService) DistrictReport(days int) ([]DistrictReportRow, error) {
	since := time.Now().AddDate(0, 0, -days)
	var rows []DistrictReportRow
	err := s.db.Raw(`
		SELECT d.name AS district,
		       (SELECT COUNT(*) FROM users u WHERE u.district_id = d.id AND u.role = 'warga') AS households,
		       COALESCE((
		         SELECT SUM(p.weight_kg) FROM pickups p
		         WHERE p.district_id = d.id AND p.created_at >= ? AND p.status = 'completed'
		       ), 0) / 1000 AS volume_ton
		FROM districts d
		ORDER BY d.name ASC
	`, since).Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	for i := range rows {
		rows[i].VolumeTon = round2(rows[i].VolumeTon)
		if rows[i].VolumeTon > 0 {
			rows[i].Status = "Optimal"
		} else {
			rows[i].Status = "Perlu Perhatian"
		}
	}
	return rows, nil
}
