import { useOutletContext } from "react-router-dom";

export interface LayoutOutletContext {
  topbarSearch: string;
}

// Pages whose search box lives in the shared Topbar (Laporan, Penjadwalan,
// Artikel) read the debounced value AdminLayout provides via <Outlet
// context={...}>. Pages without a topbar search (no `handle.searchPlaceholder`
// on their route) just get "".
export function useTopbarSearch(): string {
  const ctx = useOutletContext<LayoutOutletContext | undefined>();
  return ctx?.topbarSearch ?? "";
}
