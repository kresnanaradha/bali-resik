export type BadgeTone = "green" | "blue" | "red" | "amber" | "gray" | "purple";

const toneClasses: Record<BadgeTone, string> = {
  green: "bg-brand-50 text-brand-700",
  blue: "bg-blue-50 text-blue-600",
  red: "bg-red-50 text-red-600",
  amber: "bg-amber-50 text-amber-600",
  gray: "bg-gray-100 text-gray-600",
  purple: "bg-purple-50 text-purple-600",
};

const dotClasses: Record<BadgeTone, string> = {
  green: "bg-brand-600",
  blue: "bg-blue-500",
  red: "bg-red-500",
  amber: "bg-amber-500",
  gray: "bg-gray-400",
  purple: "bg-purple-500",
};

interface StatusBadgeProps {
  label: string;
  tone: BadgeTone;
  dot?: boolean;
}

export function StatusBadge({ label, tone, dot = true }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone]}`} />}
      {label}
    </span>
  );
}
