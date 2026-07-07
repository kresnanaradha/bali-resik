-- Bali Resik - MySQL Schema (8.0+)
-- Shared schema: dipakai oleh Admin Web, dan nantinya Mobile App (Warga & Mitra).
-- Ini adalah dokumen referensi — sumber kebenaran migrasi sebenarnya adalah
-- GORM AutoMigrate dari struct di backend/internal/domain/. Primary key
-- pakai CHAR(36) UUID (di-generate di aplikasi Go, bukan MySQL) supaya ID
-- konsisten antar web admin & mobile app dan tidak menebak jumlah baris.

-- ==========================================================
-- REFERENSI: WILAYAH
-- ==========================================================
-- Level "distrik" dipakai di Laporan/Analitik/Dasbor (agregasi per distrik).
-- kelurahan disimpan sebagai text di schedules karena hanya Penjadwalan yang
-- butuh granularitas itu.
CREATE TABLE districts (
  id              CHAR(36) PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,       -- mis. "Denpasar Selatan"
  kecamatan       VARCHAR(100) NOT NULL,
  kabupaten_kota  VARCHAR(100) NOT NULL,       -- Denpasar, Badung, Gianyar, ...
  created_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================================
-- USERS (shared: warga, mitra contact person, admin)
-- ==========================================================
CREATE TABLE users (
  id            CHAR(36) PRIMARY KEY,
  firebase_uid  VARCHAR(128) NOT NULL UNIQUE,
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  phone         VARCHAR(20),
  role          VARCHAR(20) NOT NULL DEFAULT 'warga',   -- warga | mitra | admin
  district_id   CHAR(36),
  avatar_url    TEXT,
  status        VARCHAR(20) NOT NULL DEFAULT 'active',  -- active | inactive | suspended
  joined_at     DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  created_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_users_district FOREIGN KEY (district_id) REFERENCES districts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_district ON users(district_id);

-- ==========================================================
-- MITRA (perusahaan/individu pengangkut sampah)
-- ==========================================================
CREATE TABLE mitra (
  id                        CHAR(36) PRIMARY KEY,
  user_id                   CHAR(36),   -- kontak utama / akun login mitra
  name                      VARCHAR(150) NOT NULL,
  service_area_district_id  CHAR(36),
  service_type              VARCHAR(20) NOT NULL DEFAULT 'on_demand',  -- on_demand | rutin
  phone                     VARCHAR(20),
  email                     VARCHAR(150),
  address                   TEXT,
  rating_avg                DECIMAL(2,1) NOT NULL DEFAULT 0,
  total_tasks               INT NOT NULL DEFAULT 0,
  status                    VARCHAR(25) NOT NULL DEFAULT 'pending_verification', -- pending_verification | active | inactive
  created_at                DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at                DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_mitra_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_mitra_district FOREIGN KEY (service_area_district_id) REFERENCES districts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_mitra_status ON mitra(status);

CREATE TABLE mitra_documents (
  id          CHAR(36) PRIMARY KEY,
  mitra_id    CHAR(36) NOT NULL,
  doc_type    VARCHAR(50) NOT NULL,          -- KTP, NIB, izin usaha, dst
  file_url    TEXT NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | verified | rejected
  uploaded_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_mitra_documents_mitra FOREIGN KEY (mitra_id) REFERENCES mitra(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================================
-- TPS3R / LOKASI LAYANAN
-- ==========================================================
CREATE TABLE tps_locations (
  id               CHAR(36) PRIMARY KEY,
  name             VARCHAR(150) NOT NULL,
  address          TEXT,
  district_id      CHAR(36),
  latitude         DECIMAL(9,6),
  longitude        DECIMAL(9,6),
  operating_hours  VARCHAR(100),
  created_at       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_tps_district FOREIGN KEY (district_id) REFERENCES districts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================================
-- REPORTS (Laporan Sampah dari Warga)
-- ==========================================================
CREATE TABLE reports (
  id                CHAR(36) PRIMARY KEY,
  report_code       VARCHAR(20) NOT NULL UNIQUE,   -- BR-8921
  reporter_id       CHAR(36) NOT NULL,
  waste_type        VARCHAR(20) NOT NULL,   -- organik | anorganik | plastik | kertas_kardus | logam | berbahaya | campuran | lainnya
  description       TEXT,
  location_name     VARCHAR(200),
  district_id       CHAR(36),
  latitude          DECIMAL(9,6),
  longitude         DECIMAL(9,6),
  photo_urls        JSON,
  status            VARCHAR(20) NOT NULL DEFAULT 'menunggu', -- menunggu | terverifikasi | diproses | selesai
  priority          VARCHAR(10) NOT NULL DEFAULT 'medium',   -- low | medium | high
  assigned_mitra_id CHAR(36),
  created_at        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  resolved_at       DATETIME(3),
  CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users(id),
  CONSTRAINT fk_reports_district FOREIGN KEY (district_id) REFERENCES districts(id),
  CONSTRAINT fk_reports_mitra FOREIGN KEY (assigned_mitra_id) REFERENCES mitra(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_district ON reports(district_id);
CREATE INDEX idx_reports_created_at ON reports(created_at);

-- ==========================================================
-- PICKUPS (realisasi pengangkutan — sumber stat dashboard & kinerja mitra)
-- ==========================================================
CREATE TABLE pickups (
  id            CHAR(36) PRIMARY KEY,
  mitra_id      CHAR(36) NOT NULL,
  report_id     CHAR(36),       -- diisi jika berasal dari laporan warga
  schedule_id   CHAR(36),       -- diisi jika dari jadwal rutin
  district_id   CHAR(36),
  waste_type    VARCHAR(20) NOT NULL,
  weight_kg     DECIMAL(10,2),
  status        VARCHAR(20) NOT NULL DEFAULT 'scheduled', -- scheduled | in_progress | completed | cancelled
  scheduled_at  DATETIME(3),
  completed_at  DATETIME(3),
  created_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_pickups_mitra FOREIGN KEY (mitra_id) REFERENCES mitra(id),
  CONSTRAINT fk_pickups_report FOREIGN KEY (report_id) REFERENCES reports(id),
  CONSTRAINT fk_pickups_district FOREIGN KEY (district_id) REFERENCES districts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_pickups_mitra ON pickups(mitra_id);
CREATE INDEX idx_pickups_status ON pickups(status);
CREATE INDEX idx_pickups_scheduled_at ON pickups(scheduled_at);

-- ==========================================================
-- SCHEDULES (Penjadwalan Pengangkutan rutin)
-- ==========================================================
-- Satu jadwal bisa berlaku di beberapa hari (mis. "Senin, Kamis"), makanya
-- days_of_week disimpan sebagai JSON array angka (0=Minggu..6=Sabtu),
-- bukan satu kolom. Pembatalan/perubahan untuk tanggal spesifik (mis. tag
-- "Dibatalkan" di kalender) dicatat di schedule_exceptions, bukan mengubah
-- row jadwal rutinnya.
CREATE TABLE schedules (
  id                CHAR(36) PRIMARY KEY,
  schedule_code     VARCHAR(20) NOT NULL UNIQUE,
  tps_location_id   CHAR(36) NOT NULL,
  district_id       CHAR(36) NOT NULL,  -- kecamatan
  kelurahan         VARCHAR(100) NOT NULL,
  waste_type        VARCHAR(20) NOT NULL,
  days_of_week      JSON NOT NULL,      -- mis. [1,4] = Senin & Kamis
  start_time        TIME NOT NULL,
  end_time          TIME NOT NULL,
  status            VARCHAR(10) NOT NULL DEFAULT 'draft', -- draft | active | closed
  created_at        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_schedules_tps FOREIGN KEY (tps_location_id) REFERENCES tps_locations(id),
  CONSTRAINT fk_schedules_district FOREIGN KEY (district_id) REFERENCES districts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE pickups ADD CONSTRAINT fk_pickups_schedule FOREIGN KEY (schedule_id) REFERENCES schedules(id);

-- Override per tanggal untuk jadwal rutin (kalender menampilkan tag
-- "Dibatalkan" pada tanggal tertentu tanpa mengubah pola mingguannya).
CREATE TABLE schedule_exceptions (
  id             CHAR(36) PRIMARY KEY,
  schedule_id    CHAR(36) NOT NULL,
  exception_date DATE NOT NULL,
  status         VARCHAR(15) NOT NULL,   -- cancelled | rescheduled
  note           TEXT,
  created_at     DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_schedule_exceptions_schedule FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
  UNIQUE KEY uq_schedule_exception_date (schedule_id, exception_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================================
-- ARTICLES (Kelola Artikel — juga sumber konten chatbot / menu Edukasi)
-- ==========================================================
CREATE TABLE articles (
  id               CHAR(36) PRIMARY KEY,
  title            VARCHAR(200) NOT NULL,
  slug             VARCHAR(220) NOT NULL UNIQUE,
  category         VARCHAR(50),
  excerpt          TEXT,
  content          LONGTEXT NOT NULL,      -- rich text (HTML/markdown)
  thumbnail_url    TEXT,
  author_id        CHAR(36) NOT NULL,
  status           VARCHAR(10) NOT NULL DEFAULT 'draft', -- draft | published
  views_count      INT NOT NULL DEFAULT 0,
  chatbot_indexed  BOOLEAN NOT NULL DEFAULT TRUE,  -- dipakai chatbot/menu Edukasi utk edukasi otomatis
  published_at     DATETIME(3),
  created_at       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_articles_author FOREIGN KEY (author_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_articles_status ON articles(status);

-- ==========================================================
-- POINTS TRANSACTIONS (reward warga — ledger, append-only)
-- ==========================================================
CREATE TABLE points_transactions (
  id              CHAR(36) PRIMARY KEY,
  user_id         CHAR(36) NOT NULL,
  points          INT NOT NULL,
  type            VARCHAR(10) NOT NULL,   -- earn | redeem
  reference_type  VARCHAR(30),   -- 'report' | 'pickup' | dst
  reference_id    CHAR(36),
  description     TEXT,
  created_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_points_tx_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_points_tx_user ON points_transactions(user_id);

-- ==========================================================
-- NOTIFICATIONS (bell icon di topbar admin)
-- ==========================================================
CREATE TABLE notifications (
  id          CHAR(36) PRIMARY KEY,
  user_id     CHAR(36) NOT NULL,
  title       VARCHAR(150) NOT NULL,
  body        TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
