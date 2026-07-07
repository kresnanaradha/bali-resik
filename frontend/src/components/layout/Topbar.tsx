import { Search, Bell, HelpCircle } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface TopbarProps {
  searchPlaceholder?: string;
}

export function Topbar({ searchPlaceholder }: TopbarProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      {searchPlaceholder ? (
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-brand-700">Bali Resik</span>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
            Admin Portal
          </span>
        </div>
      )}

      <div className="flex items-center gap-4 pl-4">
        <button
          type="button"
          aria-label="Bantuan"
          className="text-gray-400 hover:text-gray-600"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Notifikasi"
          className="relative text-gray-400 hover:text-gray-600"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
              {user?.fullName?.charAt(0) ?? "A"}
            </span>
          )}
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold leading-tight text-gray-900">
              {user?.fullName ?? "Admin"}
            </p>
            <p className="text-[11px] uppercase leading-tight text-gray-400">
              {user?.role ?? "admin"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
