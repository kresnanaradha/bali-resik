import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { queryKeys } from "@/lib/queryKeys";
import type { Envelope, Page } from "@/types/api";
import type { Mitra, MitraServiceType, MitraStatus } from "@/types/mitra";

export interface MitraListParams {
  search?: string;
  status?: string;
  page: number;
  limit: number;
}

export interface MitraStats {
  total: number;
  aktif: number;
  tidak_aktif: number;
  verifikasi_baru: number;
}

export function useMitraQuery(params: MitraListParams) {
  return useQuery({
    queryKey: queryKeys.mitra.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<Envelope<Page<Mitra>>>("/mitra", { params });
      return data.data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useMitraStatsQuery() {
  return useQuery({
    queryKey: queryKeys.mitra.stats(),
    queryFn: async () => {
      const { data } = await apiClient.get<Envelope<MitraStats>>("/mitra/stats");
      return data.data;
    },
  });
}

export interface MitraInput {
  name: string;
  service_area_district_id?: string | null;
  service_type: MitraServiceType;
  phone?: string;
  email?: string;
  address?: string;
}

function useInvalidateMitra() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["mitra"] });
  };
}

export function useCreateMitra() {
  const invalidate = useInvalidateMitra();
  return useMutation({
    mutationFn: async (input: MitraInput) => {
      const { data } = await apiClient.post<Envelope<Mitra>>("/mitra", input);
      return data.data;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateMitra() {
  const invalidate = useInvalidateMitra();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: MitraInput }) => {
      const { data } = await apiClient.patch<Envelope<Mitra>>(`/mitra/${id}`, input);
      return data.data;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateMitraStatus() {
  const invalidate = useInvalidateMitra();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: MitraStatus }) => {
      const { data } = await apiClient.patch<Envelope<Mitra>>(`/mitra/${id}/status`, { status });
      return data.data;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteMitra() {
  const invalidate = useInvalidateMitra();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/mitra/${id}`);
    },
    onSuccess: invalidate,
  });
}
