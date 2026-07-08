import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { Envelope, Page } from "@/types/api";
import type { Report, ReportStatus } from "@/types/report";

export interface ReportListParams {
  search?: string;
  status?: string;
  waste_type?: string;
  district_id?: string;
  date_from?: string;
  date_to?: string;
  page: number;
  limit: number;
}

export interface ReportStats {
  total: number;
  menunggu_verifikasi: number;
  sedang_diproses: number;
  selesai: number;
}

export function useReportsQuery(params: ReportListParams) {
  return useQuery({
    queryKey: ["reports", "list", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Envelope<Page<Report>>>("/reports", { params });
      return data.data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useReportStatsQuery() {
  return useQuery({
    queryKey: ["reports", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<Envelope<ReportStats>>("/reports/stats");
      return data.data;
    },
  });
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ReportStatus }) => {
      const { data } = await apiClient.patch<Envelope<Report>>(`/reports/${id}/status`, { status });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
