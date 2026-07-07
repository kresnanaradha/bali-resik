import { mitraPerformance } from "@/features/analytics/api/mockData";

export function MitraPerformanceList() {
  const max = Math.max(...mitraPerformance.map((m) => m.tonPerBulan));

  return (
    <ul className="space-y-4">
      {mitraPerformance.map((m) => (
        <li key={m.name}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-gray-700">{m.name}</span>
            <span className="font-semibold text-gray-900">{m.tonPerBulan} Ton/bln</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-brand-600"
              style={{ width: `${(m.tonPerBulan / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
