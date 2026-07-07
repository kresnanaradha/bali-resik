import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { queryKeys } from "@/lib/queryKeys";
import type { Envelope } from "@/types/api";
import type { District } from "@/types/district";

export function useDistricts(search = "") {
  return useQuery({
    queryKey: queryKeys.districts(search),
    queryFn: async () => {
      const { data } = await apiClient.get<Envelope<District[]>>("/districts", {
        params: search ? { search } : undefined,
      });
      return data.data;
    },
  });
}
