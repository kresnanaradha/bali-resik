import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  FileText,
  Handshake,
  BarChart3,
  User,
  CalendarDays,
  Newspaper,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import logo from "@/assets/logo.png";

const dashboardNav = [
  { to: "/admin/dasbor", label: "Dasbor", icon: LayoutGrid },
  { to: "/admin/laporan", label: "Laporan", icon: FileText },
];

const administrationNav = [
  { to: "/admin/mitra", label: "Mitra", icon: Handshake },
  { to: "/admin/analitik", label: "Analitik", icon: BarChart3 },
  { to: "/admin/pengguna", label: "Pengguna", icon: User },
  { to: "/admin/penjadwalan", label: "Penjadwalan", icon: CalendarDays },
  { to: "/admin/artikel", label: "Artikel", icon: Newspaper },
];

function NavSection({
  title,
  items,
}: {
  title: string;
  items: typeof dashboardNav;
}) {
  return (
    <div>
      <p className="px-3 text-[11px] font-semibold tracking-wider text-gray-400">
        {title}
      </p>
      <nav className="mt-2 flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-700 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function Sidebar() {
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col justify-between border-r border-gray-200 bg-white">
      <div>
        <div className="flex items-center gap-2 px-5 py-5">
          <img src={logo} alt="Bali Resik" className="h-8 w-8" />
          <span className="text-lg font-bold text-gray-900">Bali Resik</span>
        </div>

        <div className="flex flex-col gap-6 px-3 py-2">
          <NavSection title="DASHBOARD" items={dashboardNav} />
          <NavSection title="ADMINISTRATION" items={administrationNav} />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-gray-200 px-4 py-4">
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {user?.fullName?.charAt(0) ?? "A"}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">
            {user?.fullName ?? "Admin"}
          </p>
          <p className="truncate text-xs text-gray-500">{user?.email}</p>
        </div>
        <button
          type="button"
          onClick={() => signOut(auth)}
          aria-label="Keluar"
          className="text-gray-400 hover:text-gray-600"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
