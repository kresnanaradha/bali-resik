import type { District } from "@/types/district";

export interface TpsLocation {
  id: string;
  name: string;
  address: string;
  district_id: string | null;
  district?: District | null;
  latitude: number;
  longitude: number;
  operating_hours: string;
}
