// Data statis sementara — lihat catatan di features/dashboard/api/mockData.ts

export interface Report {
  id: string;
  code: string;
  reporterName: string;
  reporterInitials: string;
  wasteType: "plastik" | "organik" | "berbahaya" | "anorganik";
  location: string;
  date: string;
  status: "menunggu" | "terverifikasi" | "diproses" | "selesai";
}

export const reportStats = {
  total: { value: 1248, trend: 12 },
  menungguVerifikasi: { value: 84 },
  sedangDiproses: { value: 256 },
  selesai: { value: 908, resolutionRate: 94 },
};

export const reports: Report[] = [
  {
    id: "1",
    code: "#BR-8921",
    reporterName: "Agus Mahendra",
    reporterInitials: "AM",
    wasteType: "plastik",
    location: "Pantai Kuta, Badung",
    date: "20 Mei 2026, 09:15",
    status: "menunggu",
  },
  {
    id: "2",
    code: "#BR-8920",
    reporterName: "Kadek Nita",
    reporterInitials: "KN",
    wasteType: "organik",
    location: "Pasar Gianyar",
    date: "19 Mei 2026, 14:30",
    status: "terverifikasi",
  },
  {
    id: "3",
    code: "#BR-8919",
    reporterName: "Luh Putu",
    reporterInitials: "LP",
    wasteType: "berbahaya",
    location: "Tebing Uluwatu",
    date: "19 Mei 2026, 11:20",
    status: "selesai",
  },
  {
    id: "4",
    code: "#BR-8918",
    reporterName: "Wayan Made",
    reporterInitials: "WS",
    wasteType: "plastik",
    location: "Area Pelabuhan Sanur",
    date: "18 Mei 2026, 16:45",
    status: "selesai",
  },
];
