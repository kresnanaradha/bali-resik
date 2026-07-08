import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { Envelope, Page } from "@/types/api";
import type { CalendarEvent, Schedule, ScheduleStatus } from "@/types/schedule";

export interface ScheduleListParams {
  search?: string;
  kecamatan?: string;
  kelurahan?: string;
  tps_location_id?: string;
  waste_type?: string;
  status?: string;
  page: number;
  limit: number;
}

export interface ScheduleStats {
  total_jadwal_aktif: number;
  jadwal_hari_ini: number;
  wilayah_terlayani: number;
  jadwal_mendatang: number;
}

function useInvalidateSchedules() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["schedules"] });
  };
}

export function useSchedulesQuery(params: ScheduleListParams) {
  return useQuery({
    queryKey: ["schedules", "list", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Envelope<Page<Schedule>>>("/schedules", { params });
      return data.data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useScheduleStatsQuery() {
  return useQuery({
    queryKey: ["schedules", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<Envelope<ScheduleStats>>("/schedules/stats");
      return data.data;
    },
  });
}

export function useScheduleCalendar(dateISO: string) {
  return useQuery({
    queryKey: ["schedules", "calendar", dateISO],
    queryFn: async () => {
      const { data } = await apiClient.get<Envelope<CalendarEvent[]>>("/schedules/calendar", {
        params: { date: dateISO },
      });
      return data.data;
    },
  });
}

export interface ScheduleInput {
  tps_location_id: string;
  district_id: string;
  kelurahan: string;
  waste_type: string;
  days_of_week: number[];
  start_time: string;
  end_time: string;
}

export function useCreateSchedule() {
  const invalidate = useInvalidateSchedules();
  return useMutation({
    mutationFn: async (input: ScheduleInput) => {
      const { data } = await apiClient.post<Envelope<Schedule>>("/schedules", input);
      return data.data;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateSchedule() {
  const invalidate = useInvalidateSchedules();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ScheduleInput }) => {
      const { data } = await apiClient.patch<Envelope<Schedule>>(`/schedules/${id}`, input);
      return data.data;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteSchedule() {
  const invalidate = useInvalidateSchedules();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/schedules/${id}`);
    },
    onSuccess: invalidate,
  });
}

export function useCopySchedule() {
  const invalidate = useInvalidateSchedules();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<Envelope<Schedule>>(`/schedules/${id}/copy`);
      return data.data;
    },
    onSuccess: invalidate,
  });
}

export function useBulkUpdateScheduleStatus() {
  const invalidate = useInvalidateSchedules();
  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: ScheduleStatus }) => {
      const { data } = await apiClient.patch<Envelope<{ updated: number }>>("/schedules/bulk-update", { ids, status });
      return data.data;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateScheduleStatus() {
  const bulk = useBulkUpdateScheduleStatus();
  return {
    ...bulk,
    mutate: ({ id, status }: { id: string; status: ScheduleStatus }) => bulk.mutate({ ids: [id], status }),
  };
}
