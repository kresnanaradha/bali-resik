import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { weeklyTrend } from "@/features/analytics/api/mockData";

export function WeeklyTrendChart() {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={weeklyTrend} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
          />
          <Tooltip
            formatter={(value) => [`${value} kg`, undefined]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <Line type="monotone" dataKey="organik" name="Organik" stroke="#16a34a" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="anorganik" name="Anorganik" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
