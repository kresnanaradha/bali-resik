# Bali Resik

Platform digital pengelolaan sampah terpadu Bali — web admin dashboard
(React) + API (Go).

## Struktur Repo

```
frontend/   React + Vite + TypeScript + TailwindCSS (admin dashboard)
backend/    Go + Echo + GORM + MySQL (API)
docs/       Referensi skema database & daftar endpoint API
```

## Menjalankan Backend

Prasyarat: Go 1.23+, MySQL 8 berjalan di lokal (XAMPP, Laragon, Docker, atau
native — bebas). Database `bali_resik` **tidak perlu dibuat manual**,
langkah seed di bawah akan membuatnya sendiri.

```bash
cd backend
cp .env.example .env
go mod download

# Buat database, migrasi tabel, isi data contoh (aman dijalankan berkali-kali)
go run ./cmd/seed

# Jalankan API di http://localhost:8080
go run ./cmd/api
```

Setelah seed, login ke admin portal dengan:

| Email | Password |
|---|---|
| `admin@baliresik.go.id` | `admin12345` |

### Mode autentikasi (`AUTH_MODE`)

- **`dev`** (default) — melewati verifikasi token sungguhan, otomatis
  membuat 1 akun admin dev supaya API bisa langsung dites tanpa login.
- **`firebase`** — verifikasi token ID Firebase asli, butuh
  `FIREBASE_PROJECT_ID` di-set ke project Firebase sungguhan.

Terlepas dari `AUTH_MODE`, login lewat `/auth/login` atau `/auth/register`
(password di-hash bcrypt, tersimpan di database) **selalu diprioritaskan**
kalau tokennya ada — jadi setelah seed, kamu langsung pakai autentikasi asli.

### Struktur Backend

```
cmd/
  api/    entrypoint server utama
  seed/   skrip pembuat database + pengisi data contoh
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

Lihat [`docs/db-schema.sql`](docs/db-schema.sql) untuk referensi skema
(dokumentasi — migrasi sesungguhnya jalan otomatis lewat `AutoMigrate` di
`cmd/api/main.go` dan `cmd/seed/main.go`) dan
[`docs/api-endpoints.md`](docs/api-endpoints.md) untuk daftar endpoint.

## Menjalankan Frontend

Prasyarat: Node.js.

```bash
cd frontend
cp .env.example .env   # isi kredensial Firebase kalau AUTH_MODE=firebase
npm install
npm run dev
```

Buka `http://localhost:5173`. Pastikan backend sudah jalan di
`http://localhost:8080` (atau sesuai `VITE_API_BASE_URL` di `.env`).
