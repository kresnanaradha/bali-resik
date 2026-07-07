# Bali Resik Admin - Project Context

Bali Resik Admin adalah web dashboard untuk mengelola platform pengelolaan
sampah Bali Resik. Digunakan oleh admin untuk memonitor mitra pengangkut
sampah, warga, laporan, jadwal pengangkutan, dan konten edukasi.

## Tech Stack
- Frontend: React + Vite + TypeScript + TailwindCSS
- State: Zustand (client state) + TanStack Query (server state)
- Charting: Recharts
- Maps: React Leaflet (peta geospasial Bali)
- Backend: Go + Echo framework
- Database: MySQL 8 (via GORM)
- Auth: Firebase Auth (admin login email/password)

## Catatan penting
- Database dirancang SHARED, bukan admin-only — akan dipakai juga oleh
  mobile app Warga & Mitra di masa depan. Jangan buat schema/endpoint
  yang admin-only secara struktural kalau bisa dihindari.

## Desain
- Tema warna: hijau (brand utama, emerald/green — sekitar #16A34A /
  green-600 untuk tombol primer & nav aktif)
- Sidebar admin: putih/terang (bukan dark), item nav aktif berupa pill
  hijau solid dengan teks putih. Dark near-black-green gradient HANYA
  dipakai di panel kiri halaman Login (branding), bukan di sidebar app.
- Layout: sidebar kiri fixed + topbar (search, notifikasi, profil admin)
  + content area abu-abu muda dengan stat cards di atas, lalu chart/table
  di bawah dalam card putih
- Komponen stat card: icon, label, angka besar, trend indicator (+/- %)
- Ikuti struktur & layout Figma sedekat mungkin per halaman — jangan
  reka ulang bebas, screenshot dilampirkan per halaman saat implementasi

## Struktur Navigasi (sidebar)
- Dasbor
- Laporan
- Administration:
  - Mitra
  - Analitik
  - Pengguna
  - Penjadwalan
  - Artikel

## Konvensi
- Backend clean architecture (handler -> service -> repository)
- Response API: `{ "success": bool, "data": any, "message": string }`
- Role-based middleware (hanya admin yang bisa akses semua endpoint ini)
- Frontend: struktur berbasis fitur (features-based), satu folder per
  halaman/domain
