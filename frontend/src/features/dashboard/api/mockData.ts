// Data statis sementara — belum ada backend. Bentuknya mengikuti response
// yang didefinisikan di docs/api-endpoints.md supaya tinggal diganti fetcher
// TanStack Query saat API tersedia.

export interface DashboardStats {
  totalPengguna: { value: number; trend: number };
  mitraAktif: { value: number; trend: number };
  permintaanPenjemputan: { value: number; trend: number };
  laporanTertunda: { value: number; severity: "high" | "medium" | "low" };
}

export const dashboardStats: DashboardStats = {
  totalPengguna: { value: 24592, trend: 12 },
  mitraAktif: { value: 1204, trend: 5 },
  permintaanPenjemputan: { value: 8430, trend: -2 },
  laporanTertunda: { value: 342, severity: "high" },
};

export interface MapMarker {
  id: string;
  type: "illegal_dumping" | "tps";
  label: string;
  lat: number;
  lng: number;
}

export const mapMarkers: MapMarker[] = [
  { id: "m1", type: "illegal_dumping", label: "Pembuangan Ilegal - Tabanan", lat: -8.4, lng: 115.05 },
  { id: "m2", type: "illegal_dumping", label: "Pembuangan Ilegal - Buleleng", lat: -8.15, lng: 115.18 },
  { id: "m3", type: "tps", label: "TPS3R Sekar Sari - Denpasar Timur", lat: -8.62, lng: 115.24 },
  { id: "m4", type: "tps", label: "TPS3R Ubud Kaja - Ubud", lat: -8.5, lng: 115.35 },
];

export const resolutionRate = {
  resolvedPct: 78,
  resolved: 664,
  pending: 187,
};

export const districtTrend = [
  { label: "D1", volumeTon: 42 },
  { label: "D2", volumeTon: 38 },
  { label: "D3", volumeTon: 55 },
  { label: "D4", volumeTon: 47 },
  { label: "D5", volumeTon: 63 },
];
