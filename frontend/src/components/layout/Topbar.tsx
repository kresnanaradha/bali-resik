import { Search, HelpCircle } from "lucide-react";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { UserMenu } from "@/components/layout/UserMenu";

interface TopbarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function Topbar({ searchPlaceholder, searchValue, onSearchChange }: TopbarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      {searchPlaceholder ? (
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue ?? ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
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
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
