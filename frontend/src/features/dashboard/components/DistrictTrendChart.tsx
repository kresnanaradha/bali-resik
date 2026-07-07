import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { districtTrend } from "@/features/dashboard/api/mockData";

export function DistrictTrendChart() {
  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={districtTrend} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="districtTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16a34a" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
          />
          <Tooltip
            formatter={(value) => [`${value} ton`, "Volume"]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <Area
            type="monotone"
            dataKey="volumeTon"
            stroke="#16a34a"
            strokeWidth={2}
            fill="url(#districtTrendFill)"
            dot={{ r: 3, fill: "#16a34a", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
