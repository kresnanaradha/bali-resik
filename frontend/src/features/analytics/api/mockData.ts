// Data statis sementara — lihat catatan di features/dashboard/api/mockData.ts

export const analyticsStats = {
  totalPenjemputan: { value: 12842, trend: 12.5 },
  sampahTerkumpulTon: { value: 456.8, trend: 6.2 },
  tingkatPenyelesaian: { value: 94.2, targetTon: 500, progressPct: 98.4 },
  pertumbuhanPengguna: { value: 8122, delta: 340 },
};

export const weeklyTrend = [
  { day: "SEN", organik: 320, anorganik: 210 },
  { day: "SEL", organik: 280, anorganik: 240 },
  { day: "RAB", organik: 350, anorganik: 260 },
  { day: "KAM", organik: 300, anorganik: 220 },
  { day: "JUM", organik: 420, anorganik: 300 },
  { day: "SAB", organik: 380, anorganik: 280 },
  { day: "MIN", organik: 260, anorganik: 190 },
];

export const wasteDistribution = [
  { name: "Plastik", pct: 45, color: "#16a34a" },
  { name: "Kertas/Kardus", pct: 30, color: "#3b82f6" },
  { name: "Logam", pct: 15, color: "#f59e0b" },
  { name: "Lainnya", pct: 10, color: "#9ca3af" },
];

export const mitraPerformance = [
  { name: "Putu Arya Ekananda", tonPerBulan: 120 },
  { name: "Nyoman Tri Darma Wahyudi", tonPerBulan: 95 },
  { name: "Nyoman Putra Darmawan", tonPerBulan: 78 },
  { name: "Candra Wikananta", tonPerBulan: 45 },
];

export interface DistrictReportRow {
  district: string;
  households: number;
  volumeTon: number;
  status: "Optimal" | "Perlu Perhatian";
}

export const districtReport: DistrictReportRow[] = [
  { district: "Denpasar Selatan", households: 2450, volumeTon: 15.4, status: "Optimal" },
  { district: "Kuta Utara", households: 1820, volumeTon: 12.1, status: "Optimal" },
];
