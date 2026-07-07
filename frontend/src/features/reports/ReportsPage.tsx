import { useState } from "react";
import { FileText, FileWarning, Zap, CheckCircle2, FileSpreadsheet, FileDown, Eye } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { FilterBar, FilterField } from "@/components/ui/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { StatusBadge, type BadgeTone } from "@/components/ui/StatusBadge";
import { reports, reportStats, type Report } from "@/features/reports/api/mockData";

const wasteTypeTone: Record<Report["wasteType"], BadgeTone> = {
  plastik: "gray",
  organik: "green",
  berbahaya: "amber",
  anorganik: "blue",
};

const wasteTypeLabel: Record<Report["wasteType"], string> = {
  plastik: "Plastik",
  organik: "Organik",
  berbahaya: "Berbahaya",
  anorganik: "Anorganik",
};

const statusTone: Record<Report["status"], BadgeTone> = {
  menunggu: "red",
  terverifikasi: "blue",
  diproses: "blue",
  selesai: "green",
};

const statusLabel: Record<Report["status"], string> = {
  menunggu: "Menunggu",
  terverifikasi: "Terverifikasi",
  diproses: "Diproses",
  selesai: "Selesai",
};

const columns: DataTableColumn<Report>[] = [
  { key: "code", header: "ID Laporan", render: (r) => <span className="font-semibold text-brand-700">{r.code}</span> },
  {
    key: "reporter",
    header: "Pelapor",
    render: (r) => (
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
          {r.reporterInitials}
        </span>
        <span className="text-gray-700">{r.reporterName}</span>
      </div>
    ),
  },
  {
    key: "wasteType",
    header: "Jenis Sampah",
    render: (r) => <StatusBadge label={wasteTypeLabel[r.wasteType]} tone={wasteTypeTone[r.wasteType]} dot={false} />,
  },
  { key: "location", header: "Lokasi", render: (r) => <span className="text-gray-600">{r.location}</span> },
  { key: "date", header: "Tanggal", render: (r) => <span className="text-gray-500">{r.date}</span> },
  {
    key: "status",
    header: "Status",
    render: (r) => <StatusBadge label={statusLabel[r.status]} tone={statusTone[r.status]} />,
  },
  {
    key: "action",
    header: "Aksi",
    render: () => (
      <button type="button" className="text-gray-400 hover:text-brand-700" aria-label="Lihat detail">
        <Eye className="h-4 w-4" />
      </button>
    ),
  },
];

export function ReportsPage() {
  const [page, setPage] = useState(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Laporan</h1>
          <p className="mt-1 text-sm text-gray-500">
            Pantau dan verifikasi laporan masalah sampah di seluruh wilayah Bali.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary">
            <FileSpreadsheet className="h-4 w-4" />
            Ekspor Excel
          </Button>
          <Button>
            <FileDown className="h-4 w-4" />
            Ekspor PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FileText}
          iconClassName="bg-brand-50 text-brand-700"
          label="Total Laporan"
          value={reportStats.total.value.toLocaleString("id-ID")}
          badge={{ text: `+${reportStats.total.trend}%`, tone: "up" }}
        />
        <StatCard
          icon={FileWarning}
          iconClassName="bg-red-50 text-red-600"
          label="Menunggu Verifikasi"
          value={reportStats.menungguVerifikasi.value}
          badge={{ text: "Prioritas Tinggi", tone: "danger" }}
        />
        <StatCard
          icon={Zap}
          iconClassName="bg-blue-50 text-blue-600"
          label="Sedang Diproses"
          value={reportStats.sedangDiproses.value}
          badge={{ text: "Aktif", tone: "neutral" }}
        />
        <StatCard
          icon={CheckCircle2}
          iconClassName="bg-brand-50 text-brand-700"
          label="Laporan Selesai"
          value={reportStats.selesai.value.toLocaleString("id-ID")}
          badge={{ text: `Tingkat ${reportStats.selesai.resolutionRate}%`, tone: "success" }}
        />
      </div>

      <FilterBar
        title="Filter Lanjutan"
        actions={
          <>
            <Button size="sm">Cari</Button>
            <button type="button" className="text-sm font-medium text-brand-700 hover:underline">
              Hapus Semua
            </button>
          </>
        }
      >
        <FilterField label="Tanggal Laporan">
          <Input type="date" />
        </FilterField>
        <FilterField label="Status">
          <Select defaultValue="">
            <option value="">Semua Status</option>
            <option value="menunggu">Menunggu</option>
            <option value="terverifikasi">Terverifikasi</option>
            <option value="diproses">Diproses</option>
            <option value="selesai">Selesai</option>
          </Select>
        </FilterField>
        <FilterField label="Kategori Sampah">
          <Select defaultValue="">
            <option value="">Organik & Anorganik</option>
            <option value="organik">Organik</option>
            <option value="anorganik">Anorganik</option>
            <option value="berbahaya">Berbahaya</option>
          </Select>
        </FilterField>
        <FilterField label="Wilayah / Distrik">
          <Select defaultValue="">
            <option value="">Seluruh Bali</option>
            <option value="denpasar">Denpasar</option>
            <option value="badung">Badung</option>
            <option value="gianyar">Gianyar</option>
          </Select>
        </FilterField>
      </FilterBar>

      <DataTable
        columns={columns}
        data={reports}
        rowKey={(r) => r.id}
        page={page}
        pageSize={10}
        totalItems={reportStats.total.value}
        onPageChange={setPage}
      />
    </div>
  );
}
