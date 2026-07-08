# Bali Resik Backend

Go + Echo + GORM + MySQL API untuk Bali Resik Admin Portal.

## Prasyarat

- Go 1.23+
- MySQL 8 berjalan di lokal (XAMPP, Laragon, Docker, atau native — bebas).
  Cukup pastikan servernya aktif; **database `bali_resik` tidak perlu dibuat
  manual**, langkah di bawah akan membuatnya sendiri.

## Setup

1. Salin file environment:
   ```bash
   cp .env.example .env
   ```
   Nilai default di `.env` sudah cocok untuk MySQL lokal tanpa password
   (`root` tanpa password, port 3306). Sesuaikan `DB_DSN` kalau setup MySQL
   kamu beda.

2. Install dependency:
   ```bash
   go mod download
   ```

## Membuat & Mengisi Database (Seed)

Jalankan sekali untuk membuat database `bali_resik`, semua tabel, dan
mengisinya dengan data contoh (distrik, TPS3R, mitra, warga, laporan,
jadwal, riwayat pengangkutan 30 hari terakhir, artikel, notifikasi):

```bash
go run ./cmd/seed
```

Setelah selesai, kamu bisa login ke admin portal dengan:

| Email | Password |
|---|---|
| `admin@baliresik.go.id` | `admin12345` |

**Aman dijalankan berkali-kali** — setiap jenis data dicek dulu, kalau sudah
ada akan dilewati (tidak membuat duplikat, tidak error).

## Menjalankan API

```bash
go run ./cmd/api
```

Server jalan di `http://localhost:8080` (atau sesuai `PORT` di `.env`).
Cek dengan:
```bash
curl http://localhost:8080/health
```

### Mode autentikasi (`AUTH_MODE`)

- **`dev`** (default) — melewati verifikasi token sungguhan, otomatis
  membuat 1 akun admin dev supaya API bisa langsung dites tanpa login. Cocok
  untuk development cepat.
- **`firebase`** — verifikasi token ID Firebase asli, butuh
  `FIREBASE_PROJECT_ID` di-set ke project Firebase sungguhan.

Terlepas dari `AUTH_MODE`, login lewat `/auth/login` atau `/auth/register`
(pakai password yang tersimpan di database, di-hash dengan bcrypt) **selalu
diprioritaskan** kalau tokennya ada — jadi setelah seed + login pakai akun
admin di atas, kamu sudah pakai autentikasi asli tanpa perlu ubah apa-apa.

## Struktur

```
cmd/
  api/    entrypoint server utama
  seed/   skrip pengisi data contoh (dokumen ini)
internal/
  domain/       model data (GORM structs)
  repository/   akses database per entity
  service/      logic bisnis per entity
  handler/      HTTP handler (Echo) per entity
  middleware/   auth (Firebase / local JWT / dev bypass), role-guard
  config/       load .env
  db/           koneksi MySQL + perbaikan tipe kolom pasca-migrasi
pkg/
  response/     format response {success, data, message}
  httpx/        helper pagination & bind+validate
  validate/     adapter go-playground/validator
```

Lihat juga [`docs/db-schema.sql`](../docs/db-schema.sql) untuk referensi skema
(dokumentasi — migrasi sesungguhnya jalan otomatis lewat `AutoMigrate` di
`cmd/api/main.go` dan `cmd/seed/main.go`) dan
[`docs/api-endpoints.md`](../docs/api-endpoints.md) untuk daftar endpoint.
