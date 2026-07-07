import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { queryKeys } from "@/lib/queryKeys";
import type { Envelope, Page } from "@/types/api";
import type { User, UserRole, UserStatus } from "@/types/user";

export interface UserListParams {
  search?: string;
  role?: string;
  district_id?: string;
  status?: string;
  page: number;
  limit: number;
}

export interface UserStats {
  total: number;
  warga: number;
  mitra: number;
  admin: number;
}

export function useUsersQuery(params: UserListParams) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<Envelope<Page<User>>>("/users", { params });
      return data.data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useUserStatsQuery() {
  return useQuery({
    queryKey: queryKeys.users.stats(),
    queryFn: async () => {
      const { data } = await apiClient.get<Envelope<UserStats>>("/users/stats");
      return data.data;
    },
  });
}

export interface UserInput {
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  district_id?: string | null;
}

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };
}

export function useCreateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: async (input: UserInput) => {
      const { data } = await apiClient.post<Envelope<User>>("/users", input);
      return data.data;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UserInput }) => {
      const { data } = await apiClient.patch<Envelope<User>>(`/users/${id}`, input);
      return data.data;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateUserStatus() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: UserStatus }) => {
      const { data } = await apiClient.patch<Envelope<User>>(`/users/${id}/status`, { status });
      return data.data;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/users/${id}`);
    },
    onSuccess: invalidate,
  });
}
