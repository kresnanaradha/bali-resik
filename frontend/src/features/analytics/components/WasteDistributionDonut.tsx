import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { WasteDistributionSlice } from "@/types/analytics";

const colorByLabel: Record<string, string> = {
  Plastik: "#16a34a",
  Organik: "#22c55e",
  Anorganik: "#3b82f6",
  "Kertas/Kardus": "#3b82f6",
  Logam: "#9ca3af",
  Berbahaya: "#ef4444",
  Campuran: "#f59e0b",
  Lainnya: "#9ca3af",
};
const fallbackColors = ["#16a34a", "#3b82f6", "#f59e0b", "#9ca3af", "#ef4444", "#22c55e"];

export function WasteDistributionDonut({ data }: { data: WasteDistributionSlice[] }) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-400">Belum ada data pengangkutan pada rentang ini.</p>;
  }

  return (
    <div>
      <div className="relative h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="pct" nameKey="name" innerRadius={52} outerRadius={70} stroke="none">
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={colorByLabel[entry.name] ?? fallbackColors[i % fallbackColors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-900">100%</span>
          <span className="text-xs text-gray-500">Total</span>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {data.map((entry, i) => (
          <li key={entry.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: colorByLabel[entry.name] ?? fallbackColors[i % fallbackColors.length] }}
              />
              {entry.name}
            </span>
            <span className="font-medium text-gray-900">{entry.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
