import type { District } from "@/types/district";
import type { TpsLocation } from "@/types/tpsLocation";
import type { WasteType } from "@/types/report";

export type ScheduleStatus = "draft" | "active" | "closed";

export interface Schedule {
  id: string;
  schedule_code: string;
  tps_location_id: string;
  tps_location?: TpsLocation | null;
  district_id: string;
  district?: District | null;
  kelurahan: string;
  waste_type: WasteType;
  days_of_week: number[];
  start_time: string;
  end_time: string;
  status: ScheduleStatus;
  created_at: string;
}

export type ScheduleExceptionStatus = "cancelled" | "rescheduled";

export interface ScheduleException {
  id: string;
  schedule_id: string;
  exception_date: string;
  status: ScheduleExceptionStatus;
  note: string;
}

export interface CalendarEvent {
  date: string;
  schedule_id: string;
  tps_name: string;
  waste_type: WasteType;
  start_time: string;
  status: "scheduled" | "cancelled" | "rescheduled";
}
