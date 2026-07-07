# Struktur Folder

## Frontend (`frontend/`)

Features-based: satu folder per halaman/domain, isinya komponen + hook
data-fetching sendiri. Komponen yang dipakai lintas halaman naik ke
`components/`.

```
frontend/
  src/
    app/                    # root App.tsx, router, providers (QueryClient, Zustand)
    assets/                 # logo, ilustrasi, icon statis
    components/
      ui/                   # Button, Input, Modal, StatusBadge, DataTable, DateRangePicker...
      layout/               # AdminLayout, Sidebar, Topbar
      charts/               # wrapper Recharts (DonutChart, BarChart, LineChart)
    lib/                    # axios/fetch client, firebase.ts, query-keys.ts, utils.ts
    stores/                 # zustand stores (auth store, ui store)
    hooks/                  # hooks lintas fitur (useDebounce, usePagination, dst)
    types/                  # shared TS types (User, Mitra, Report, dst — mirror schema)
    features/
      auth/                 # Login page
        components/
        api/                # useLogin, useLogout (TanStack Query + firebase)
      dashboard/             # Dasbor Analitik (stat card, peta, donut, bar chart)
      reports/               # Manajemen Laporan
      mitra/                 # Manajemen Mitra
      analytics/             # Analitik (halaman terpisah dari Dasbor)
      users/                  # Manajemen Pengguna
      schedules/              # Penjadwalan Pengangkutan
      articles/               # Kelola Artikel
  public/
```

Setiap `features/<nama>/` berisi:
- `<Nama>Page.tsx` — halaman utama, dirender oleh router
- `components/` — komponen spesifik halaman itu (mis. `ReportTable.tsx`, `ReportFilterBar.tsx`)
- `api/` — TanStack Query hooks (`useReports.ts`, `useCreateReport.ts`) yang manggil `lib/apiClient`

## Backend (`backend/`)

Clean architecture: `handler -> service -> repository`, sesuai konvensi
di CLAUDE.md. Sudah diimplementasikan — bukan lagi draft.

```
backend/
  cmd/api/main.go            # entrypoint: load config, connect MySQL, AutoMigrate,
                              # wiring repo->service->handler, daftar semua route
  internal/
    domain/                  # GORM struct per entity (District, User, Mitra,
                              # MitraDocument, TpsLocation, Report, Pickup,
                              # Schedule, ScheduleException, Article,
                              # PointsTransaction, Notification) + Base
                              # (UUID PK + timestamps, dipakai via embedding)
    repository/               # Base[T] generik (Create/FindByID/Update/Delete/
                              # List/Count via GORM + Go generics) + repo per
                              # entity yang nambah filter/List spesifik
    service/                  # business logic + DTO input per entity (mis.
                              # generate report_code/schedule_code/slug,
                              # hitung stats, logika kalender jadwal)
    handler/                  # Echo handler per entity, daftar routes-nya sendiri
                              # lewat method Register(*echo.Group)
    middleware/
      auth.go                 # resolve user dari Firebase ID token ATAU dev
                              # bypass (AUTH_MODE=dev, auto-provision admin),
                              # RequireAdmin role-guard
      firebaseauth/            # verifikasi Firebase ID token (RS256 + JWKS
                              # Google) tanpa firebase-admin-go SDK
    config/                   # load .env (PORT, DB_DSN, AUTH_MODE, dst)
    db/                       # koneksi GORM ke MySQL
  pkg/
    response/                 # Envelope {success,data,message} + helper Paginate
    httpx/                    # helper Pagination(c) & BindAndValidate(c, &dto)
    validate/                 # adapter go-playground/validator ke echo.Validator
  docker-compose.yml          # MySQL 8 lokal untuk dev
  .env.example
```

Migrasi tabel jalan otomatis lewat `gormDB.AutoMigrate(...)` di `main.go`
setiap start — `docs/db-schema.sql` adalah dokumen referensi/desain, bukan
lagi yang dieksekusi langsung.

Response wrapper standar dipakai di semua handler:
```go
type Response struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data"`
    Message string      `json:"message"`
}
```
