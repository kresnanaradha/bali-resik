package main

import (
	"log"
	"net/http"

	"github.com/labstack/echo/v4"
	echomw "github.com/labstack/echo/v4/middleware"

	"bali-resik-backend/internal/config"
	"bali-resik-backend/internal/db"
	"bali-resik-backend/internal/domain"
	"bali-resik-backend/internal/handler"
	appmw "bali-resik-backend/internal/middleware"
	"bali-resik-backend/internal/repository"
	"bali-resik-backend/internal/service"
	"bali-resik-backend/pkg/response"
	"bali-resik-backend/pkg/validate"
)

func main() {
	cfg := config.Load()

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

	e := echo.New()
	e.Validator = validate.New()
	e.Use(echomw.Logger())
	e.Use(echomw.Recover())
	e.Use(echomw.CORSWithConfig(echomw.CORSConfig{
		AllowOrigins: []string{cfg.AllowedOrigin},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization, "X-Dev-Uid"},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPatch, http.MethodDelete},
	}))

	e.GET("/health", func(c echo.Context) error {
		return response.OK(c, map[string]string{"status": "ok"}, "Bali Resik API berjalan")
	})

	api := e.Group("/api/v1")
	api.Use(appmw.Auth(cfg, gormDB))
	api.Use(appmw.RequireAdmin)

	handler.NewAuthHandler().Register(api)
	handler.NewUserHandler(service.NewUserService(repository.NewUserRepository(gormDB))).Register(api)
	handler.NewMitraHandler(service.NewMitraService(
		repository.NewMitraRepository(gormDB),
		repository.NewMitraDocumentRepository(gormDB),
	)).Register(api)
	handler.NewDistrictHandler(service.NewDistrictService(repository.NewDistrictRepository(gormDB))).Register(api)
	handler.NewTpsLocationHandler(service.NewTpsLocationService(repository.NewTpsLocationRepository(gormDB))).Register(api)
	handler.NewReportHandler(service.NewReportService(repository.NewReportRepository(gormDB))).Register(api)
	handler.NewScheduleHandler(service.NewScheduleService(
		repository.NewScheduleRepository(gormDB),
		repository.NewScheduleExceptionRepository(gormDB),
	)).Register(api)
	handler.NewArticleHandler(service.NewArticleService(repository.NewArticleRepository(gormDB))).Register(api)
	handler.NewPickupHandler(service.NewPickupService(repository.NewPickupRepository(gormDB))).Register(api)
	handler.NewPointsTransactionHandler(service.NewPointsTransactionService(repository.NewPointsTransactionRepository(gormDB))).Register(api)
	handler.NewNotificationHandler(service.NewNotificationService(repository.NewNotificationRepository(gormDB))).Register(api)
	handler.NewAnalyticsHandler(service.NewAnalyticsService(gormDB)).Register(api)

	log.Printf("Auth mode: %s", cfg.AuthMode)
	e.Logger.Fatal(e.Start(":" + cfg.Port))
}
