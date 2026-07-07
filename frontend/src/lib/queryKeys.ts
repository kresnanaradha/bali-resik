export const queryKeys = {
  districts: (search?: string) => ["districts", search ?? ""] as const,
  users: {
    list: (params: unknown) => ["users", "list", params] as const,
    stats: () => ["users", "stats"] as const,
  },
  mitra: {
    list: (params: unknown) => ["mitra", "list", params] as const,
    stats: () => ["mitra", "stats"] as const,
    documents: (mitraId: string) => ["mitra", mitraId, "documents"] as const,
  },
};
