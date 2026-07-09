import type { District } from "@/types/district";
import type { User } from "@/types/user";
import type { Mitra } from "@/types/mitra";

export type WasteType =
  | "organik"
  | "anorganik"
  | "plastik"
  | "kertas_kardus"
  | "logam"
  | "berbahaya"
  | "campuran"
  | "lainnya";

export type ReportStatus = "menunggu" | "terverifikasi" | "diproses" | "selesai";
export type ReportPriority = "low" | "medium" | "high";

export interface Report {
  id: string;
  report_code: string;
  reporter_id: string;
  reporter?: User | null;
  waste_type: WasteType;
  description: string;
  location_name: string;
  district_id: string | null;
  district?: District | null;
  status: ReportStatus;
  priority: ReportPriority;
  assigned_mitra_id: string | null;
  assigned_mitra?: Mitra | null;
  photo_urls: string[] | null;
  latitude: number;
  longitude: number;
  resolved_at: string | null;
  created_at: string;
}
