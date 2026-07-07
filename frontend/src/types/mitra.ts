import type { District } from "@/types/district";

export type MitraServiceType = "on_demand" | "rutin";
export type MitraStatus = "pending_verification" | "active" | "inactive";

export interface Mitra {
  id: string;
  user_id: string | null;
  name: string;
  service_area_district_id: string | null;
  service_area_district?: District | null;
  service_type: MitraServiceType;
  phone: string;
  email: string;
  address: string;
  rating_avg: number;
  total_tasks: number;
  status: MitraStatus;
  created_at: string;
}
