import type { ReactNode } from "react";

interface FilterBarProps {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function FilterBar({ title = "Filter Lanjutan", children, actions }: FilterBarProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-gray-700">{title}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
      {actions && <div className="mt-3 flex items-center gap-4">{actions}</div>}
    </div>
  );
}

interface FilterFieldProps {
  label: string;
  children: ReactNode;
}

export function FilterField({ label, children }: FilterFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  );
}
