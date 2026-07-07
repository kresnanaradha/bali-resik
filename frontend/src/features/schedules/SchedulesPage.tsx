import { useState } from "react";
import {
  CheckCircle2,
  CalendarClock,
  MapPin,
  CalendarRange,
  Plus,
  RotateCcw,
  Download,
  Copy,
  ListChecks,
  Upload,
  Info,
  Recycle,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FilterBar, FilterField } from "@/components/ui/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { StatusBadge, type BadgeTone } from "@/components/ui/StatusBadge";
import { ScheduleCalendar } from "@/features/schedules/components/ScheduleCalendar";
import { scheduleStats, nearbyTps, schedules, wasteTagStyle, type ScheduleRow } from "@/features/schedules/api/mockData";

const statusTone: Record<ScheduleRow["status"], BadgeTone> = {
  aktif: "green",
  draft: "gray",
  ditutup: "red",
};

const statusLabel: Record<ScheduleRow["status"], string> = {
  aktif: "Aktif",
  draft: "Draft",
  ditutup: "Ditutup",
};

const wasteLabel: Record<ScheduleRow["wasteType"], string> = {
  organik: "Organik",
  anorganik: "Anorganik",
  campuran: "Campuran",
};

const columns: DataTableColumn<ScheduleRow>[] = [
  { key: "code", header: "ID Jadwal", render: (s) => <span className="font-semibold text-brand-700">{s.code}</span> },
  { key: "tps", header: "TPS3R", render: (s) => <span className="font-medium text-gray-800">{s.tps}</span> },
  { key: "kecamatan", header: "Kecamatan", render: (s) => <span className="text-gray-600">{s.kecamatan}</span> },
  { key: "kelurahan", header: "Kelurahan", render: (s) => <span className="text-gray-600">{s.kelurahan}</span> },
  {
    key: "wasteType",
    header: "Jenis Sampah",
    render: (s) => <StatusBadge label={wasteLabel[s.wasteType]} tone={s.wasteType === "organik" ? "green" : s.wasteType === "anorganik" ? "blue" : "amber"} dot={false} />,
  },
  { key: "days", header: "Hari", render: (s) => <span className="text-gray-600">{s.days}</span> },
  { key: "hours", header: "Jam Operasional", render: (s) => <span className="text-gray-500">{s.hours}</span> },
  { key: "status", header: "Status", render: (s) => <StatusBadge label={statusLabel[s.status]} tone={statusTone[s.status]} /> },
];

export function SchedulesPage() {
  const [page, setPage] = useState(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Penjadwalan Pengangkutan Sampah</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola jadwal pengangkutan sampah berdasarkan wilayah dan jenis sampah.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Buat Jadwal Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CheckCircle2} iconClassName="bg-brand-50 text-brand-700" label="Total Jadwal Aktif" value={scheduleStats.totalJadwalAktif} />
        <StatCard icon={CalendarClock} iconClassName="bg-blue-50 text-blue-600" label="Jadwal Hari Ini" value={scheduleStats.jadwalHariIni} />
        <StatCard icon={MapPin} iconClassName="bg-amber-50 text-amber-600" label="Wilayah Terlayani" value={scheduleStats.wilayahTerlayani} />
        <StatCard icon={CalendarRange} iconClassName="bg-brand-50 text-brand-700" label="Jadwal Mendatang" value={scheduleStats.jadwalMendatang} />
      </div>

      <FilterBar
        title="Rentang Tanggal"
        actions={
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <button type="button" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700">
              <RotateCcw className="h-3.5 w-3.5" /> Reset Filter
            </button>
            <button type="button" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700">
              <Download className="h-3.5 w-3.5" /> Ekspor Jadwal
            </button>
            <button type="button" className="flex items-center gap-1.5 text-brand-700 hover:underline">
              <Copy className="h-3.5 w-3.5" /> Copy Jadwal
            </button>
            <button type="button" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700">
              <ListChecks className="h-3.5 w-3.5" /> Bulk Update
            </button>
            <button type="button" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700">
              <Upload className="h-3.5 w-3.5" /> Import Excel
            </button>
          </div>
        }
      >
        <FilterField label="Rentang Tanggal">
          <Input type="date" />
        </FilterField>
        <FilterField label="Kecamatan">
          <Select defaultValue="">
            <option value="">Semua</option>
            <option value="denpasar-timur">Denpasar Timur</option>
            <option value="ubud">Ubud</option>
            <option value="kuta">Kuta</option>
          </Select>
        </FilterField>
        <FilterField label="Kelurahan">
          <Select defaultValue="">
            <option value="">Semua</option>
          </Select>
        </FilterField>
        <FilterField label="TPS3R">
          <Select defaultValue="">
            <option value="">Semua</option>
            <option value="sekar-sari">Sekar Sari</option>
            <option value="ubud-kaja">Ubud Kaja</option>
          </Select>
        </FilterField>
      </FilterBar>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 lg:col-span-2">
          <ScheduleCalendar />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-gray-900">Legenda Jenis Sampah</p>
            <ul className="space-y-2 text-sm text-gray-600">
              {Object.entries(wasteTagStyle).map(([key, style]) => (
                <li key={key} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                  {style.label === "Organik" && "Organik (Daur Ulang Hayati)"}
                  {style.label === "Anorganik" && "Anorganik (Plastik/Logam)"}
                  {style.label === "Campuran" && "Campuran (Residu)"}
                  {style.label === "Dibatalkan" && "Jadwal Dibatalkan"}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2 rounded-xl border border-brand-100 bg-brand-50 p-4">
            <Info className="h-4 w-4 shrink-0 text-brand-700" />
            <div>
              <p className="text-sm font-semibold text-brand-800">Informasi Sinkronisasi</p>
              <p className="mt-0.5 text-xs text-brand-700">
                Jadwal yang dipublikasikan akan langsung ditampilkan pada aplikasi warga Bali Resik secara real-time.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-gray-900">Layanan Terdekat</p>
            <ul className="space-y-3">
              {nearbyTps.map((tps) => (
                <li key={tps.name} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Recycle className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{tps.name}</p>
                    <p className="text-xs text-gray-500">{tps.location}</p>
                  </div>
                  <span className="text-xs font-medium text-gray-500">{tps.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-gray-900">Daftar Jadwal Pengangkutan</p>
        <DataTable
          columns={columns}
          data={schedules}
          rowKey={(s) => s.id}
          page={page}
          pageSize={10}
          totalItems={124}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
