import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

type BadgeTone = "up" | "down" | "success" | "warning" | "danger" | "neutral";

const badgeToneClasses: Record<BadgeTone, string> = {
  up: "bg-brand-50 text-brand-700",
  down: "bg-red-50 text-red-600",
  success: "bg-brand-50 text-brand-700",
  warning: "bg-amber-50 text-amber-600",
  danger: "bg-red-50 text-red-600",
  neutral: "bg-gray-100 text-gray-500",
};

interface StatCardProps {
  icon: LucideIcon;
  iconClassName?: string;
  label: string;
  value: string | number;
  valueClassName?: string;
  badge?: { text: string; tone: BadgeTone };
}

export function StatCard({
  icon: Icon,
  iconClassName = "bg-brand-50 text-brand-700",
  label,
  value,
  valueClassName = "text-gray-900",
  badge,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClassName}`}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        {badge && (
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badgeToneClasses[badge.tone]}`}
          >
            {badge.tone === "up" && <TrendingUp className="h-3 w-3" />}
            {badge.tone === "down" && <TrendingDown className="h-3 w-3" />}
            {badge.text}
          </span>
        )}
      </div>
      <p className="mt-3 text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valueClassName}`}>{value}</p>
    </div>
  );
}
