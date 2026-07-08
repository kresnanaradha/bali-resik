package db

import "gorm.io/gorm"

// FixColumnTypes forces column types that GORM's AutoMigrate doesn't apply
// reliably. Observed in practice: schedules.start_time/end_time keep getting
// (re-)created as DATETIME(3) instead of TIME on every AutoMigrate run,
// silently reverting any earlier manual fix — so this runs on every startup
// instead of being a one-off migration.
func FixColumnTypes(db *gorm.DB) error {
	stmts := []string{
		"ALTER TABLE schedules MODIFY start_time TIME NOT NULL",
		"ALTER TABLE schedules MODIFY end_time TIME NOT NULL",
	}
	for _, stmt := range stmts {
		if err := db.Exec(stmt).Error; err != nil {
			return err
		}
	}
	return nil
}
