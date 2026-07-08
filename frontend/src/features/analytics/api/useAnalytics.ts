import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { Envelope } from "@/types/api";
import type {
  AnalyticsOverview,
  WeeklyTrendPoint,
  WasteDistributionSlice,
  MitraPerformanceRow,
  DistrictReportRow,
} from "@/types/analytics";

export function useAnalyticsOverview(range: string) {
  return useQuery({
    queryKey: ["analytics", "overview", range],
    queryFn: async () => {
      const { data } = await apiClient.get<Envelope<AnalyticsOverview>>("/analytics/overview", { params: { range } });
      return data.data;
    },
  });
}

export function useWeeklyTrend(range: string) {
  return useQuery({
    queryKey: ["analytics", "weekly-trend", range],
    queryFn: async () => {
      const { data } = await apiClient.get<Envelope<WeeklyTrendPoint[]>>("/analytics/weekly-trend", { params: { range } });
      return data.data;
    },
  });
}

export function useWasteDistribution(range: string) {
  return useQuery({
    queryKey: ["analytics", "waste-distribution", range],
    queryFn: async () => {
      const { data } = await apiClient.get<Envelope<WasteDistributionSlice[]>>("/analytics/waste-distribution", { params: { range } });
      return data.data;
    },
  });
}

export function useMitraPerformance(range: string, limit = 10) {
  return useQuery({
    queryKey: ["analytics", "mitra-performance", range, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<Envelope<MitraPerformanceRow[]>>("/analytics/mitra-performance", {
        params: { range, limit },
      });
      return data.data;
    },
  });
}

export function useDistrictReport(range: string) {
  return useQuery({
    queryKey: ["analytics", "district-report", range],
    queryFn: async () => {
      const { data } = await apiClient.get<Envelope<DistrictReportRow[]>>("/analytics/district-report", { params: { range } });
      return data.data;
    },
  });
}
