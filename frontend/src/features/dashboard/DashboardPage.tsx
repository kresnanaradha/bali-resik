import { Users, Gem, Truck, AlertTriangle, CalendarDays, Download, MapPin } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { GeoMap } from "@/features/dashboard/components/GeoMap";
import { ResolutionDonut } from "@/features/dashboard/components/ResolutionDonut";
import { DistrictTrendChart } from "@/features/dashboard/components/DistrictTrendChart";
import { dashboardStats } from "@/features/dashboard/api/mockData";

function trendBadge(trend: number) {
  return { text: `${trend > 0 ? "+" : ""}${trend}%`, tone: trend >= 0 ? ("up" as const) : ("down" as const) };
}

export function DashboardPage() {
  const stats = dashboardStats;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Metrik real-time untuk efisiensi manajemen sampah dan operasional.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <CalendarDays className="h-4 w-4 text-gray-400" />
            30 Hari Terakhir
          </button>
          <Button>
            <Download className="h-4 w-4" />
            Ekspor Laporan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          iconClassName="bg-brand-50 text-brand-700"
          label="Total Pengguna"
          value={stats.totalPengguna.value.toLocaleString("id-ID")}
          badge={trendBadge(stats.totalPengguna.trend)}
        />
        <StatCard
          icon={Gem}
          iconClassName="bg-blue-50 text-blue-600"
          label="Mitra Aktif"
          value={stats.mitraAktif.value.toLocaleString("id-ID")}
          badge={trendBadge(stats.mitraAktif.trend)}
        />
        <StatCard
          icon={Truck}
          iconClassName="bg-amber-50 text-amber-600"
          label="Permintaan Penjemputan"
          value={stats.permintaanPenjemputan.value.toLocaleString("id-ID")}
          badge={trendBadge(stats.permintaanPenjemputan.trend)}
        />
        <StatCard
          icon={AlertTriangle}
          iconClassName="bg-red-50 text-red-600"
          label="Laporan Sampah (Tertunda)"
          value={stats.laporanTertunda.value.toLocaleString("id-ID")}
          valueClassName="text-red-600"
          badge={{ text: "High", tone: "danger" }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                <MapPin className="h-4 w-4 text-gray-400" />
                Peta Geospasial
              </p>
              <p className="text-xs text-gray-500">Pantau hotspots & lokasi TPS</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Pembuangan Ilegal
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand-600" /> Lokasi TPS
              </span>
            </div>
          </div>
          <GeoMap />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-gray-900">Tingkat Resolusi</p>
            <p className="text-xs text-gray-500">Dilaporkan vs Diselesaikan (Bulan Ini)</p>
            <ResolutionDonut />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-gray-900">Tren Berdasarkan Distrik</p>
            <p className="text-xs text-gray-500">Volume dalam ton (Mingguan)</p>
            <DistrictTrendChart />
          </div>
        </div>
      </div>
    </div>
  );
}
