import { useState } from "react";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationsQuery, useMarkNotificationRead } from "@/features/notifications/api/useNotifications";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const userId = useAuthStore((s) => s.user?.id) ?? "";
  const { data } = useNotificationsQuery(userId);
  const markRead = useMarkNotificationRead();

  const items = data?.items ?? [];
  const unreadCount = items.filter((n) => !n.is_read).length;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifikasi"
        className="relative text-gray-400 hover:text-gray-600"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />}
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Tutup notifikasi"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
            <p className="px-4 py-1.5 text-sm font-semibold text-gray-900">Notifikasi</p>
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">Tidak ada notifikasi.</p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => !n.is_read && markRead.mutate(n.id)}
                      className={`block w-full px-4 py-2.5 text-left hover:bg-gray-50 ${!n.is_read ? "bg-brand-50/40" : ""}`}
                    >
                      <span className="flex items-start gap-2">
                        {!n.is_read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />}
                        <span className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">{n.title}</p>
                          {n.body && <p className="mt-0.5 text-xs text-gray-500">{n.body}</p>}
                          <p className="mt-1 text-[11px] text-gray-400">{new Date(n.created_at).toLocaleString("id-ID")}</p>
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
