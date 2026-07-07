// Data statis sementara — lihat catatan di features/dashboard/api/mockData.ts

export const scheduleStats = {
  totalJadwalAktif: 124,
  jadwalHariIni: 18,
  wilayahTerlayani: 42,
  jadwalMendatang: 56,
};

export type WasteTag = "organik" | "anorganik" | "campuran" | "dibatalkan";

export const wasteTagStyle: Record<WasteTag, { label: string; className: string; dot: string }> = {
  organik: { label: "Organik", className: "bg-brand-50 text-brand-700", dot: "bg-brand-600" },
  anorganik: { label: "Anorganik", className: "bg-blue-50 text-blue-600", dot: "bg-blue-500" },
  campuran: { label: "Campuran", className: "bg-amber-50 text-amber-600", dot: "bg-amber-500" },
  dibatalkan: { label: "Dibatalkan", className: "bg-red-50 text-red-600", dot: "bg-red-500" },
};

export interface CalendarEvent {
  date: number; // day-of-month, for the displayed month
  time?: string;
  tag: WasteTag;
}

// Contoh untuk bulan yang ditampilkan (Mei 2026)
export const calendarEvents: CalendarEvent[] = [
  { date: 1, tag: "organik" },
  { date: 1, tag: "anorganik" },
  { date: 2, tag: "campuran" },
  { date: 5, time: "08:00", tag: "organik" },
  { date: 5, tag: "dibatalkan" },
  { date: 8, tag: "organik" },
  { date: 12, tag: "anorganik" },
  { date: 15, tag: "campuran" },
  { date: 19, tag: "organik" },
  { date: 22, tag: "anorganik" },
  { date: 26, tag: "campuran" },
];

export interface NearbyTps {
  name: string;
  location: string;
  time: string;
}

export const nearbyTps: NearbyTps[] = [
  { name: "TPS3R Sekar Sari", location: "Denpasar Timur", time: "09:00" },
  { name: "TPS3R Ubud Kaja", location: "Ubud, Gianyar", time: "10:30" },
];

export interface ScheduleRow {
  id: string;
  code: string;
  tps: string;
  kecamatan: string;
  kelurahan: string;
  wasteType: "organik" | "anorganik" | "campuran";
  days: string;
  hours: string;
  status: "aktif" | "draft" | "ditutup";
}

export const schedules: ScheduleRow[] = [
  {
    id: "1",
    code: "#SCH-001",
    tps: "Sekar Sari",
    kecamatan: "Denpasar Timur",
    kelurahan: "Kesiman",
    wasteType: "organik",
    days: "Senin, Kamis",
    hours: "08:00 - 11:00",
    status: "aktif",
  },
  {
    id: "2",
    code: "#SCH-002",
    tps: "Ubud Kaja",
    kecamatan: "Ubud",
    kelurahan: "Ubud Kaja",
    wasteType: "anorganik",
    days: "Selasa, Jumat",
    hours: "09:00 - 13:00",
    status: "draft",
  },
  {
    id: "3",
    code: "#SCH-003",
    tps: "Seminyak Clean",
    kecamatan: "Kuta",
    kelurahan: "Seminyak",
    wasteType: "campuran",
    days: "Rabu, Sabtu",
    hours: "07:30 - 10:30",
    status: "ditutup",
  },
];
