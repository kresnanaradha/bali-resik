import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { resolutionRate } from "@/features/dashboard/api/mockData";

const data = [
  { name: "Diselesaikan", value: resolutionRate.resolvedPct },
  { name: "Tertunda", value: 100 - resolutionRate.resolvedPct },
];

const COLORS = ["#16a34a", "#bbf7d0"];

export function ResolutionDonut() {
  return (
    <div>
      <div className="relative h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={62}
              outerRadius={82}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-brand-700">{resolutionRate.resolvedPct}%</span>
          <span className="text-xs text-gray-500">Diselesaikan</span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-5 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-600" /> Diselesaikan
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-200" /> Tertunda
        </span>
      </div>
    </div>
  );
}
