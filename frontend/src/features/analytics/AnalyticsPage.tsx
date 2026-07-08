import { useState } from "react";
import { Truck, Package, Target, Users, Download } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { WeeklyTrendChart } from "@/features/analytics/components/WeeklyTrendChart";
import { WasteDistributionDonut } from "@/features/analytics/components/WasteDistributionDonut";
import { MitraPerformanceList } from "@/features/analytics/components/MitraPerformanceList";
import {
  useAnalyticsOverview,
  useWeeklyTrend,
  useWasteDistribution,
  useMitraPerformance,
  useDistrictReport,
} from "@/features/analytics/api/useAnalytics";
import { downloadCsv } from "@/lib/exportCsv";

export function AnalyticsPage() {
  const [range, setRange] = useState("7d");

  const overviewQuery = useAnalyticsOverview(range);
  const weeklyTrendQuery = useWeeklyTrend(range);
  const wasteDistributionQuery = useWasteDistribution(range);
  const mitraPerformanceQuery = useMitraPerformance(range);
  const districtReportQuery = useDistrictReport(range);

  const stats = overviewQuery.data;
  const progressPct = stats ? Math.min(100, (stats.sampah_terkumpul_ton / stats.target_ton) * 100) : 0;
  const districtReport = districtReportQuery.data ?? [];

  function handleExport() {
    if (!stats) return;
    downloadCsv(`analitik-${range}-${new Date().toISOString().slice(0, 10)}.csv`, [
      { Metrik: "Total Penjemputan", Nilai: stats.total_penjemputan, Tren: `${stats.total_penjemputan_trend_pct}%` },
      { Metrik: "Sampah Terkumpul (Ton)", Nilai: stats.sampah_terkumpul_ton, Tren: `${stats.sampah_terkumpul_trend_pct}%` },
      { Metrik: "Tingkat Penyelesaian", Nilai: `${stats.tingkat_penyelesaian}%`, Tren: "-" },
      { Metrik: "Pertumbuhan Pengguna", Nilai: stats.pertumbuhan_pengguna, Tren: `+${stats.pertumbuhan_delta}` },
      ...districtReport.map((d) => ({ Metrik: `Distrik: ${d.district}`, Nilai: `${d.volume_ton} ton`, Tren: d.status })),
    ]);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Pantau metrik keberlanjutan real-time di seluruh provinsi Bali.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onChange={(e) => setRange(e.target.value)} className="w-40">
            <option value="7d">7 Hari Terakhir</option>
            <option value="30d">30 Hari Terakhir</option>
            <option value="90d">90 Hari Terakhir</option>
          </Select>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4" />
            Ekspor Analitik
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Truck}
          iconClassName="bg-brand-50 text-brand-700"
          label="Total Penjemputan"
          value={stats?.total_penjemputan ?? "-"}
          badge={stats ? { text: `${stats.total_penjemputan_trend_pct >= 0 ? "+" : ""}${stats.total_penjemputan_trend_pct}%`, tone: stats.total_penjemputan_trend_pct >= 0 ? "up" : "down" } : undefined}
        />
        <StatCard
          icon={Package}
          iconClassName="bg-blue-50 text-blue-600"
          label="Sampah Terkumpul (Ton)"
          value={stats?.sampah_terkumpul_ton ?? "-"}
          badge={stats ? { text: `${stats.sampah_terkumpul_trend_pct >= 0 ? "+" : ""}${stats.sampah_terkumpul_trend_pct}%`, tone: stats.sampah_terkumpul_trend_pct >= 0 ? "up" : "down" } : undefined}
        />

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Target className="h-4.5 w-4.5" />
            </span>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
              {Math.round(progressPct)}%
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-500">Tingkat Penyelesaian</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.tingkat_penyelesaian ?? "-"}%</p>
          <div className="mt-2 h-1.5 rounded-full bg-gray-100">
            <div className="h-1.5 rounded-full bg-brand-600" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-gray-400">Target: {stats?.target_ton ?? "-"} Ton</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Users className="h-4.5 w-4.5" />
            </span>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
              +{stats?.pertumbuhan_delta ?? 0}
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-500">Pertumbuhan Pengguna</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.pertumbuhan_pengguna ?? "-"}</p>
          <p className="mt-1.5 text-xs text-gray-400">Total warga terdaftar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 lg:col-span-2">
          <p className="text-sm font-semibold text-gray-900">Tren Pengumpulan Mingguan</p>
          <p className="text-xs text-gray-500">Total berat (kg) terkumpul per hari di seluruh sektor</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-600" /> Organik
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" /> Anorganik
            </span>
          </div>
          <WeeklyTrendChart data={weeklyTrendQuery.data ?? []} />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-semibold text-gray-900">Distribusi Sampah</p>
          <WasteDistributionDonut data={wasteDistributionQuery.data ?? []} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-gray-900">Kinerja Mitra</p>
          <MitraPerformanceList data={mitraPerformanceQuery.data ?? []} />
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <p className="px-4 pt-4 text-sm font-semibold text-gray-900">Laporan per Distrik</p>
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Distrik</th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Rumah Tangga</th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Volume (Ton)</th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {districtReport.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400">
                    Belum ada data distrik.
                  </td>
                </tr>
              ) : (
                districtReport.map((row) => (
                  <tr key={row.district} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-800">{row.district}</td>
                    <td className="px-4 py-3 text-gray-600">{row.households.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 text-gray-600">{row.volume_ton}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={row.status} tone={row.status === "Optimal" ? "green" : "amber"} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
