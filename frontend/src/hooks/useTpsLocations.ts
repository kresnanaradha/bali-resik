import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { Envelope } from "@/types/api";
import type { TpsLocation } from "@/types/tpsLocation";

export function useTpsLocations(districtId = "") {
  return useQuery({
    queryKey: ["tps-locations", districtId],
    queryFn: async () => {
      const { data } = await apiClient.get<Envelope<TpsLocation[]>>("/tps-locations", {
        params: districtId ? { district_id: districtId } : undefined,
      });
      return data.data;
    },
  });
}
