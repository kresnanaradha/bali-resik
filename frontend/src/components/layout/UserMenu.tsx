import { useState } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/hooks/useLogout";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 border-l border-gray-200 pl-4"
      >
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.fullName} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            {user?.fullName?.charAt(0) ?? "A"}
          </span>
        )}
        <div className="hidden text-left sm:block">
          <p className="text-sm font-semibold leading-tight text-gray-900">{user?.fullName ?? "Admin"}</p>
          <p className="text-[11px] uppercase leading-tight text-gray-400">{user?.role ?? "admin"}</p>
        </div>
        <ChevronDown className="hidden h-3.5 w-3.5 text-gray-400 sm:block" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Tutup menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
            <div className="border-b border-gray-100 px-4 pb-2">
              <p className="truncate text-sm font-semibold text-gray-900">{user?.fullName ?? "Admin"}</p>
              <p className="truncate text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="mt-1 flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
