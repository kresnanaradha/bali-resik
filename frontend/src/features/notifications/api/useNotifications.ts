import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { Envelope, Page } from "@/types/api";
import type { AppNotification } from "@/types/notification";

export function useNotificationsQuery(userId: string) {
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      const { data } = await apiClient.get<Envelope<Page<AppNotification>>>("/notifications", {
        params: { user_id: userId, limit: 10 },
      });
      return data.data;
    },
    enabled: !!userId,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<Envelope<AppNotification>>(`/notifications/${id}/read`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
