import type { MitraPerformanceRow } from "@/types/analytics";

export function MitraPerformanceList({ data }: { data: MitraPerformanceRow[] }) {
  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-400">Belum ada pengangkutan selesai pada rentang ini.</p>;
  }

  const max = Math.max(...data.map((m) => m.ton_per_bulan));

  return (
    <ul className="space-y-4">
      {data.map((m) => (
        <li key={m.name}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-gray-700">{m.name}</span>
            <span className="font-semibold text-gray-900">{m.ton_per_bulan} Ton</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-brand-600"
              style={{ width: `${max > 0 ? (m.ton_per_bulan / max) * 100 : 0}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
