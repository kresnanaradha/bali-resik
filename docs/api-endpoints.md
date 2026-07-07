# API Endpoints

Implemented di `backend/`. Base URL: `/api/v1`. Semua response pakai wrapper:
`{ "success": bool, "data": any, "message": string }`.

Semua endpoint (termasuk `/auth/*`) butuh header `Authorization: Bearer <firebase_id_token>`
dan role `admin` — middleware auth yang memverifikasi token itu juga yang
me-resolve user untuk `/auth/me`. Saat `AUTH_MODE=dev` (default lokal), token
tidak diverifikasi sungguhan — middleware auto-provision 1 admin dev supaya
API bisa dites tanpa project Firebase asli (lihat `backend/.env.example`).

## Auth
| Method | Path | Deskripsi |
|---|---|---|
| POST | `/auth/verify` | Verifikasi Firebase ID token, sinkronisasi/ambil profil admin, return user + role |
| POST | `/auth/logout` | Invalidate sesi sisi server (jika ada refresh-token tracking) |
| GET | `/auth/me` | Profil admin yang sedang login |

## Dasbor (`/dashboard`)
| Method | Path | Deskripsi |
|---|---|---|
| GET | `/dashboard/stats?range=30d` | 4 stat card: total pengguna, mitra aktif, pengangkutan terlaksana, laporan tertunda (+ trend %) |
| GET | `/dashboard/map-markers` | Marker peta: pengangkutan aktif + lokasi TPS (lat/lng, type) |
| GET | `/dashboard/resolution-rate?range=30d` | Data donut: terselesaikan vs tertunda |
| GET | `/dashboard/district-trend?range=30d` | Data bar chart: volume sampah per distrik per minggu |
| GET | `/dashboard/export?range=30d&format=pdf` | Ekspor laporan dasbor |

## Laporan (`/reports`)
| Method | Path | Deskripsi |
|---|---|---|
| GET | `/reports?search=&status=&waste_type=&district_id=&date_from=&date_to=&page=&limit=` | List + filter + pagination |
| GET | `/reports/stats` | 4 stat card: total, menunggu verifikasi, diproses, selesai |
| GET | `/reports/:id` | Detail 1 laporan |
| PATCH | `/reports/:id/status` | Ubah status (menunggu/terverifikasi/diproses/selesai) |
| PATCH | `/reports/:id/assign` | Assign ke mitra |
| GET | `/reports/export?format=xlsx\|pdf&...filter` | Ekspor Excel/PDF sesuai filter aktif |

## Mitra (`/mitra`)
| Method | Path | Deskripsi |
|---|---|---|
| GET | `/mitra?search=&status=&page=&limit=` | List + filter tab (Semua/Aktif/Verifikasi/Nonaktif) |
| GET | `/mitra/stats` | 4 stat card: total, aktif, tidak aktif, notifikasi baru |
| GET | `/mitra/:id` | Detail mitra + dokumen + performa |
| POST | `/mitra` | Tambah mitra baru |
| PATCH | `/mitra/:id` | Edit data mitra |
| PATCH | `/mitra/:id/status` | Approve/reject/nonaktifkan |
| GET | `/mitra/:id/documents` | List dokumen verifikasi |
| PATCH | `/mitra/:id/documents/:docId/status` | Verifikasi/tolak dokumen |
| GET | `/mitra/export` | Ekspor daftar mitra |

## Analitik (`/analytics`)
| Method | Path | Deskripsi |
|---|---|---|
| GET | `/analytics/overview?range=7d` | 4 stat card: total pengumpulan, sampah terkumpul (ton), tingkat penyelesaian, pengangkutan terlambat |
| GET | `/analytics/weekly-trend?range=7d` | Line chart 2 series: organik vs anorganik per hari |
| GET | `/analytics/waste-distribution?range=7d` | Donut: plastik/kertas-kardus/logam/lainnya |
| GET | `/analytics/mitra-performance?range=7d&limit=10` | Bar list kinerja mitra (ton/bulan) |
| GET | `/analytics/district-report?range=7d` | Tabel: distrik, rumah tangga, volume ton, status |
| GET | `/analytics/export?range=7d&format=pdf` | Ekspor laporan analitik |

## Pengguna (`/users`)
| Method | Path | Deskripsi |
|---|---|---|
| GET | `/users?search=&role=&district_id=&status=&page=&limit=` | List + filter |
| GET | `/users/stats` | 4 stat card: total, warga, mitra, admin |
| GET | `/users/:id` | Detail pengguna |
| POST | `/users` | Tambah pengguna baru (buat entri Firebase + row users) |
| PATCH | `/users/:id` | Edit profil/role/wilayah |
| PATCH | `/users/:id/status` | Aktifkan/nonaktifkan/suspend |
| DELETE | `/users/:id` | Hapus pengguna |

## Penjadwalan (`/schedules`)
| Method | Path | Deskripsi |
|---|---|---|
| GET | `/schedules?date_from=&date_to=&kecamatan=&kelurahan=&tps_location_id=&waste_type=&page=&limit=` | Tabel "Daftar Jadwal Pengangkutan" + filter lanjutan |
| GET | `/schedules/stats` | 4 stat card: total jadwal aktif, jadwal hari ini, wilayah terlayani, jadwal mendatang |
| GET | `/schedules/calendar?view=month\|week\|day&date=2026-05-05&...filter` | Data kalender (per tanggal: jenis sampah + status, termasuk exception "Dibatalkan") |
| GET | `/schedules/:id` | Detail 1 jadwal (untuk modal buat/edit) |
| POST | `/schedules` | Buat jadwal baru |
| PATCH | `/schedules/:id` | Edit jadwal (termasuk ubah status draft/aktif/ditutup) |
| DELETE | `/schedules/:id` | Hapus jadwal |
| POST | `/schedules/:id/copy` | Duplikasi jadwal ("Copy Jadwal") jadi draft baru |
| PATCH | `/schedules/bulk-update` | Update massal (status/jam/dll) untuk beberapa `id` sekaligus |
| POST | `/schedules/import` | Import jadwal dari file Excel (multipart) |
| GET | `/schedules/export?format=xlsx&...filter` | "Ekspor Jadwal" |
| POST | `/schedules/:id/exceptions` | Tandai tanggal tertentu batal/reschedule (tanpa ubah pola mingguan) |
| DELETE | `/schedules/:id/exceptions/:exceptionId` | Hapus override tanggal tsb |
| GET | `/tps-locations?district_id=&search=` | List TPS3R (dropdown filter "TPS3R" + panel "Layanan Terdekat") |

## Artikel (`/articles`)
| Method | Path | Deskripsi |
|---|---|---|
| GET | `/articles?search=&status=&category=&author_id=&page=&limit=` | List + filter |
| GET | `/articles/stats` | 4 stat card: total, dipublikasikan, draft, total pembaca |
| GET | `/articles/:id` | Detail artikel (untuk editor) |
| POST | `/articles` | Buat artikel baru (draft/publish) |
| PATCH | `/articles/:id` | Edit artikel |
| PATCH | `/articles/:id/publish` | Publish / unpublish |
| DELETE | `/articles/:id` | Hapus artikel |
| GET | `/chatbot/articles` | Endpoint publik/internal khusus dikonsumsi chatbot (hanya artikel published & chatbot_indexed=true) |

## Reference
| Method | Path | Deskripsi |
|---|---|---|
| GET | `/districts` | List distrik/kecamatan untuk dropdown filter di semua halaman |
