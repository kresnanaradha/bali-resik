import { useEffect, useState } from "react";
import { Outlet, useLocation, useMatches } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { LayoutOutletContext } from "@/hooks/useTopbarSearch";

interface RouteHandle {
  searchPlaceholder?: string;
}

export function AdminLayout() {
  const matches = useMatches();
  const handle = matches.at(-1)?.handle as RouteHandle | undefined;
  const location = useLocation();

  const [rawSearch, setRawSearch] = useState("");
  const debouncedSearch = useDebouncedValue(rawSearch);

  // Topbar search is contextual per page ("Cari laporan..." vs "Cari
  // jadwal..."), so it must not carry over when navigating to another page.
  useEffect(() => {
    setRawSearch("");
  }, [location.pathname]);

  const outletContext: LayoutOutletContext = { topbarSearch: debouncedSearch };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          searchPlaceholder={handle?.searchPlaceholder}
          searchValue={rawSearch}
          onSearchChange={setRawSearch}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  );
}
