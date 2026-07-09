// Command seed creates the database (if it doesn't exist), migrates all
// tables, and fills them with realistic sample data — so a fresh checkout
// or a wiped database can be brought to a demoable state in one command:
//
//	go run ./cmd/seed
//
// Safe to re-run: each entity checks whether it already has rows and skips
// itself if so, instead of erroring on duplicate unique keys.
package main

import (
	"database/sql"
	"fmt"
	"log"
	"math/rand"
	"time"

	mysqldriver "github.com/go-sql-driver/mysql"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/datatypes"
	"gorm.io/gorm"

	"bali-resik-backend/internal/config"
	"bali-resik-backend/internal/db"
	"bali-resik-backend/internal/domain"
)

const seedAdminEmail = "admin@baliresik.go.id"
const seedAdminPassword = "admin12345"

func main() {
	cfg := config.Load()

	if err := ensureDatabase(cfg.DBDSN); err != nil {
		log.Fatalf("gagal membuat database: %v", err)
	}

	gormDB, err := db.Connect(cfg.DBDSN)
	if err != nil {
		log.Fatalf("gagal konek ke MySQL: %v", err)
	}

	if err := gormDB.AutoMigrate(
		&domain.District{},
		&domain.User{},
		&domain.Mitra{},
		&domain.MitraDocument{},
		&domain.TpsLocation{},
		&domain.Report{},
		&domain.Schedule{},
		&domain.ScheduleException{},
		&domain.Pickup{},
		&domain.Article{},
		&domain.PointsTransaction{},
		&domain.Notification{},
	); err != nil {
		log.Fatalf("gagal migrasi database: %v", err)
	}
	if err := db.FixColumnTypes(gormDB); err != nil {
		log.Fatalf("gagal memperbaiki tipe kolom: %v", err)
	}

	districts := seedDistricts(gormDB)
	tpsLocations := seedTpsLocations(gormDB, districts)
	admin := seedAdmin(gormDB)
	warga := seedWarga(gormDB, districts)
	mitraList := seedMitra(gormDB, districts)
	seedReports(gormDB, warga, districts)
	seedSchedules(gormDB, tpsLocations, districts)
	seedPickups(gormDB, mitraList, districts)
	seedArticles(gormDB, admin)
	seedNotifications(gormDB, admin)

	fmt.Println("\nSelesai. Login ke admin portal dengan:")
	fmt.Printf("  Email:    %s\n", seedAdminEmail)
	fmt.Printf("  Password: %s\n", seedAdminPassword)
}

// ensureDatabase connects without selecting a database and issues CREATE
// DATABASE IF NOT EXISTS — GORM's AutoMigrate only creates tables inside an
// already-existing database, not the database itself.
func ensureDatabase(dsn string) error {
	parsed, err := mysqldriver.ParseDSN(dsn)
	if err != nil {
		return err
	}
	dbName := parsed.DBName
	parsed.DBName = ""

	rootDB, err := sql.Open("mysql", parsed.FormatDSN())
	if err != nil {
		return err
	}
	defer rootDB.Close()

	_, err = rootDB.Exec(fmt.Sprintf(
		"CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci", dbName,
	))
	return err
}

func findDistrictID(districts []domain.District, name string) *string {
	for _, d := range districts {
		if d.Name == name {
			return &d.ID
		}
	}
	return nil
}

func seedDistricts(gdb *gorm.DB) []domain.District {
	var existing []domain.District
	gdb.Find(&existing)
	if len(existing) > 0 {
		fmt.Println("Distrik sudah ada, lewati.")
		return existing
	}

	districts := []domain.District{
		{Name: "Denpasar Selatan", Kecamatan: "Denpasar Selatan", KabupatenKota: "Denpasar"},
		{Name: "Denpasar Timur", Kecamatan: "Denpasar Timur", KabupatenKota: "Denpasar"},
		{Name: "Kuta", Kecamatan: "Kuta", KabupatenKota: "Badung"},
		{Name: "Kuta Utara", Kecamatan: "Kuta Utara", KabupatenKota: "Badung"},
		{Name: "Ubud", Kecamatan: "Ubud", KabupatenKota: "Gianyar"},
		{Name: "Singaraja", Kecamatan: "Buleleng", KabupatenKota: "Buleleng"},
	}
	for i := range districts {
		if err := gdb.Create(&districts[i]).Error; err != nil {
			log.Fatalf("gagal seed distrik: %v", err)
		}
	}
	fmt.Printf("Seeded %d distrik\n", len(districts))
	return districts
}

func seedTpsLocations(gdb *gorm.DB, districts []domain.District) []domain.TpsLocation {
	var existing []domain.TpsLocation
	gdb.Find(&existing)
	if len(existing) > 0 {
		fmt.Println("TPS3R sudah ada, lewati.")
		return existing
	}

	locations := []domain.TpsLocation{
		{Name: "TPS3R Sekar Sari", Address: "Kesiman, Denpasar Timur", DistrictID: findDistrictID(districts, "Denpasar Timur"), Latitude: -8.62, Longitude: 115.24, OperatingHours: "08:00 - 11:00"},
		{Name: "TPS3R Ubud Kaja", Address: "Ubud Kaja, Ubud", DistrictID: findDistrictID(districts, "Ubud"), Latitude: -8.50, Longitude: 115.35, OperatingHours: "09:00 - 13:00"},
		{Name: "TPS3R Seminyak Clean", Address: "Seminyak, Kuta", DistrictID: findDistrictID(districts, "Kuta"), Latitude: -8.69, Longitude: 115.17, OperatingHours: "07:30 - 10:30"},
	}
	for i := range locations {
		if err := gdb.Create(&locations[i]).Error; err != nil {
			log.Fatalf("gagal seed TPS3R: %v", err)
		}
	}
	fmt.Printf("Seeded %d TPS3R\n", len(locations))
	return locations
}

func seedAdmin(gdb *gorm.DB) domain.User {
	var existing []domain.User
	gdb.Where("email = ?", seedAdminEmail).Find(&existing)
	if len(existing) > 0 {
		fmt.Println("Admin sudah ada, lewati.")
		return existing[0]
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(seedAdminPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("gagal hash password admin: %v", err)
	}
	admin := domain.User{
		FirebaseUID:  "local:seed-admin",
		FullName:     "Admin Utama",
		Email:        seedAdminEmail,
		Phone:        "+62 811-0000-0001",
		Role:         domain.RoleAdmin,
		Status:       domain.UserStatusActive,
		PasswordHash: string(hash),
	}
	if err := gdb.Create(&admin).Error; err != nil {
		log.Fatalf("gagal seed admin: %v", err)
	}
	fmt.Println("Seeded 1 admin")
	return admin
}

func seedWarga(gdb *gorm.DB, districts []domain.District) []domain.User {
	var existing []domain.User
	gdb.Where("role = ?", domain.RoleWarga).Find(&existing)
	if len(existing) > 0 {
		fmt.Println("Warga sudah ada, lewati.")
		return existing
	}
	if len(districts) == 0 {
		return nil
	}

	data := []struct{ name, email, phone string }{
		{"Agus Mahendra", "agus.mahendra@example.com", "+62 812-1111-2222"},
		{"Kadek Nita", "kadek.nita@example.com", "+62 813-2222-3333"},
		{"Luh Putu", "luh.putu@example.com", "+62 814-3333-4444"},
	}
	var users []domain.User
	for i, n := range data {
		district := districts[i%len(districts)]
		u := domain.User{
			FirebaseUID: fmt.Sprintf("local:seed-warga-%d", i),
			FullName:    n.name,
			Email:       n.email,
			Phone:       n.phone,
			Role:        domain.RoleWarga,
			DistrictID:  &district.ID,
			Status:      domain.UserStatusActive,
		}
		if err := gdb.Create(&u).Error; err != nil {
			log.Fatalf("gagal seed warga: %v", err)
		}
		users = append(users, u)
	}
	fmt.Printf("Seeded %d warga\n", len(users))
	return users
}

func seedMitra(gdb *gorm.DB, districts []domain.District) []domain.Mitra {
	var existing []domain.Mitra
	gdb.Find(&existing)
	if len(existing) > 0 {
		fmt.Println("Mitra sudah ada, lewati.")
		return existing
	}

	data := []struct {
		name, district, phone, email string
		status                       domain.MitraStatus
		rating                       float64
		tasks                        int
	}{
		{"Bakti Resik Denpasar", "Denpasar Selatan", "+62 812-0000-1111", "bakti@resik.id", domain.MitraStatusActive, 4.9, 1204},
		{"Karya Hijau Kuta", "Kuta", "+62 819-0000-2222", "karya@hijau.id", domain.MitraStatusActive, 4.7, 856},
		{"Semesta Bersih", "Ubud", "+62 821-0000-3333", "semesta@bersih.id", domain.MitraStatusPendingVerification, 0, 0},
	}

	var mitraList []domain.Mitra
	for _, d := range data {
		m := domain.Mitra{
			Name:                  d.name,
			ServiceAreaDistrictID: findDistrictID(districts, d.district),
			ServiceType:           domain.MitraServiceOnDemand,
			Phone:                 d.phone,
			Email:                 d.email,
			RatingAvg:             d.rating,
			TotalTasks:            d.tasks,
			Status:                d.status,
		}
		if err := gdb.Create(&m).Error; err != nil {
			log.Fatalf("gagal seed mitra: %v", err)
		}
		mitraList = append(mitraList, m)
	}
	fmt.Printf("Seeded %d mitra\n", len(mitraList))
	return mitraList
}

func seedReports(gdb *gorm.DB, warga []domain.User, districts []domain.District) {
	var count int64
	gdb.Model(&domain.Report{}).Count(&count)
	if count > 0 {
		fmt.Println("Laporan sudah ada, lewati.")
		return
	}
	if len(warga) == 0 || len(districts) == 0 {
		return
	}

	data := []struct {
		waste    domain.WasteType
		location string
		desc     string
		priority domain.ReportPriority
		status   domain.ReportStatus
		photos   []string
	}{
		{
			domain.WastePlastik, "Pantai Kuta, Badung", "Sampah plastik menumpuk di pinggir pantai",
			domain.PriorityMedium, domain.ReportMenunggu,
			[]string{"https://picsum.photos/seed/br-1000-a/800/600", "https://picsum.photos/seed/br-1000-b/800/600"},
		},
		{
			domain.WasteOrganik, "Pasar Gianyar", "Sampah organik pasar tidak diangkut",
			domain.PriorityHigh, domain.ReportMenunggu,
			[]string{"https://picsum.photos/seed/br-1001-a/800/600"},
		},
		{
			domain.WasteBerbahaya, "Tebing Uluwatu", "Limbah B3 dibuang sembarangan",
			domain.PriorityHigh, domain.ReportTerverifikasi,
			[]string{"https://picsum.photos/seed/br-1002-a/800/600", "https://picsum.photos/seed/br-1002-b/800/600", "https://picsum.photos/seed/br-1002-c/800/600"},
		},
	}

	for i, d := range data {
		reporter := warga[i%len(warga)]
		district := districts[i%len(districts)]
		r := domain.Report{
			ReportCode:   fmt.Sprintf("BR-%04d", 1000+i),
			ReporterID:   reporter.ID,
			WasteType:    d.waste,
			Description:  d.desc,
			LocationName: d.location,
			DistrictID:   &district.ID,
			Status:       d.status,
			Priority:     d.priority,
			PhotoURLs:    d.photos,
		}
		if err := gdb.Create(&r).Error; err != nil {
			log.Fatalf("gagal seed laporan: %v", err)
		}
	}
	fmt.Printf("Seeded %d laporan\n", len(data))
}

func seedSchedules(gdb *gorm.DB, tpsLocations []domain.TpsLocation, districts []domain.District) {
	var existing []domain.Schedule
	gdb.Find(&existing)
	if len(existing) > 0 {
		fmt.Println("Jadwal sudah ada, lewati.")
		return
	}
	if len(tpsLocations) == 0 {
		return
	}

	data := []struct {
		tpsIdx     int
		district   string
		kelurahan  string
		waste      domain.WasteType
		days       []int
		start, end string
		status     domain.ScheduleStatus
	}{
		{0, "Denpasar Timur", "Kesiman", domain.WasteOrganik, []int{1, 4}, "08:00", "11:00", domain.ScheduleActive},
		{1, "Ubud", "Ubud Kaja", domain.WasteAnorganik, []int{2, 5}, "09:00", "13:00", domain.ScheduleDraft},
		{2, "Kuta", "Seminyak", domain.WasteCampuran, []int{3, 6}, "07:30", "10:30", domain.ScheduleClosed},
	}

	seeded := 0
	for i, d := range data {
		if d.tpsIdx >= len(tpsLocations) {
			continue
		}
		s := domain.Schedule{
			ScheduleCode:  fmt.Sprintf("SCH-%04d", 1000+i),
			TpsLocationID: tpsLocations[d.tpsIdx].ID,
			DistrictID:    *findDistrictID(districts, d.district),
			Kelurahan:     d.kelurahan,
			WasteType:     d.waste,
			DaysOfWeek:    datatypes.NewJSONSlice(d.days),
			StartTime:     d.start,
			EndTime:       d.end,
			Status:        d.status,
		}
		if err := gdb.Create(&s).Error; err != nil {
			log.Fatalf("gagal seed jadwal: %v", err)
		}
		seeded++
	}
	fmt.Printf("Seeded %d jadwal\n", seeded)
}

func seedPickups(gdb *gorm.DB, mitraList []domain.Mitra, districts []domain.District) {
	var count int64
	gdb.Model(&domain.Pickup{}).Count(&count)
	if count > 0 {
		fmt.Println("Data pengangkutan sudah ada, lewati.")
		return
	}

	var activeMitra *domain.Mitra
	for i := range mitraList {
		if mitraList[i].Status == domain.MitraStatusActive {
			activeMitra = &mitraList[i]
			break
		}
	}
	if activeMitra == nil || len(districts) == 0 {
		return
	}

	wasteTypes := []domain.WasteType{domain.WasteOrganik, domain.WasteAnorganik, domain.WastePlastik, domain.WasteKertasKardus}
	r := rand.New(rand.NewSource(42))
	inserted := 0

	for daysAgo := 0; daysAgo < 30; daysAgo++ {
		date := time.Now().AddDate(0, 0, -daysAgo)
		n := 2 + r.Intn(3)
		for i := 0; i < n; i++ {
			district := districts[r.Intn(len(districts))]
			status := domain.PickupCompleted
			if r.Intn(10) == 0 {
				status = domain.PickupCancelled
			}
			createdAt := date.Add(time.Duration(r.Intn(12)) * time.Hour)

			p := domain.Pickup{
				MitraID:    activeMitra.ID,
				DistrictID: &district.ID,
				WasteType:  wasteTypes[r.Intn(len(wasteTypes))],
				WeightKg:   20 + r.Float64()*180,
				Status:     status,
			}
			p.CreatedAt = createdAt // GORM only auto-fills this if it's still zero
			if err := gdb.Create(&p).Error; err != nil {
				log.Fatalf("gagal seed pengangkutan: %v", err)
			}
			inserted++
		}
	}
	fmt.Printf("Seeded %d pengangkutan (30 hari terakhir)\n", inserted)
}

func seedArticles(gdb *gorm.DB, admin domain.User) {
	var count int64
	gdb.Model(&domain.Article{}).Count(&count)
	if count > 0 {
		fmt.Println("Artikel sudah ada, lewati.")
		return
	}

	now := time.Now()
	articles := []domain.Article{
		{
			Title: "Cara Memilah Sampah Organik dan Anorganik", Slug: "cara-memilah-sampah-organik-dan-anorganik",
			Category: "edukasi", Excerpt: "Panduan singkat memilah sampah rumah tangga.",
			Content: "<p>Konten lengkap di sini.</p>", AuthorID: admin.ID,
			Status: domain.ArticlePublished, ChatbotIndexed: true, PublishedAt: &now,
		},
		{
			Title: "Jadwal Pengangkutan Sampah di Wilayah Denpasar", Slug: "jadwal-pengangkutan-sampah-denpasar",
			Category: "regulasi", Excerpt: "Info jadwal pengangkutan terbaru.",
			Content: "<p>Konten lengkap di sini.</p>", AuthorID: admin.ID,
			Status: domain.ArticleDraft, ChatbotIndexed: true,
		},
	}
	for i := range articles {
		if err := gdb.Create(&articles[i]).Error; err != nil {
			log.Fatalf("gagal seed artikel: %v", err)
		}
	}
	fmt.Printf("Seeded %d artikel\n", len(articles))
}

func seedNotifications(gdb *gorm.DB, admin domain.User) {
	var count int64
	gdb.Model(&domain.Notification{}).Where("user_id = ?", admin.ID).Count(&count)
	if count > 0 {
		fmt.Println("Notifikasi sudah ada, lewati.")
		return
	}

	notifications := []domain.Notification{
		{UserID: admin.ID, Title: "Laporan baru menunggu verifikasi", Body: "Ada laporan sampah baru yang perlu ditinjau."},
		{UserID: admin.ID, Title: "Mitra baru mendaftar", Body: "Ada mitra baru menunggu verifikasi dokumen."},
	}
	for i := range notifications {
		if err := gdb.Create(&notifications[i]).Error; err != nil {
			log.Fatalf("gagal seed notifikasi: %v", err)
		}
	}
	fmt.Printf("Seeded %d notifikasi\n", len(notifications))
}
