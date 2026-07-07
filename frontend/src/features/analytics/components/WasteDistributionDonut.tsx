import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { wasteDistribution } from "@/features/analytics/api/mockData";

export function WasteDistributionDonut() {
  return (
    <div>
      <div className="relative h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={wasteDistribution}
              dataKey="pct"
              nameKey="name"
              innerRadius={52}
              outerRadius={70}
              stroke="none"
            >
              {wasteDistribution.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
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
        {wasteDistribution.map((entry) => (
          <li key={entry.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-medium text-gray-900">{entry.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
