export interface AnalyticsOverview {
  total_penjemputan: number;
  total_penjemputan_trend_pct: number;
  sampah_terkumpul_ton: number;
  sampah_terkumpul_trend_pct: number;
  tingkat_penyelesaian: number;
  target_ton: number;
  pertumbuhan_pengguna: number;
  pertumbuhan_delta: number;
}

export interface WeeklyTrendPoint {
  day: string;
  organik: number;
  anorganik: number;
}

export interface WasteDistributionSlice {
  name: string;
  pct: number;
}

export interface MitraPerformanceRow {
  name: string;
  ton_per_bulan: number;
}

export interface DistrictReportRow {
  district: string;
  households: number;
  volume_ton: number;
  status: string;
}
