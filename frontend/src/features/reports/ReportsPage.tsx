import { useState } from "react";
import { FileText, FileWarning, Zap, CheckCircle2, FileSpreadsheet, FileDown } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { FilterBar, FilterField } from "@/components/ui/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { StatusBadge, type BadgeTone } from "@/components/ui/StatusBadge";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { useDistricts } from "@/hooks/useDistricts";
import { useTopbarSearch } from "@/hooks/useTopbarSearch";
import { useReportsQuery, useReportStatsQuery, useUpdateReportStatus } from "@/features/reports/api/useReports";
import { downloadCsv } from "@/lib/exportCsv";
import { downloadPdf } from "@/lib/exportPdf";
import type { Report, ReportStatus, WasteType } from "@/types/report";

const wasteTypeTone: Record<WasteType, BadgeTone> = {
  plastik: "gray",
  organik: "green",
  anorganik: "blue",
  kertas_kardus: "amber",
  logam: "gray",
  berbahaya: "red",
  campuran: "amber",
  lainnya: "gray",
};

const wasteTypeLabel: Record<WasteType, string> = {
  plastik: "Plastik",
  organik: "Organik",
  anorganik: "Anorganik",
  kertas_kardus: "Kertas/Kardus",
  logam: "Logam",
  berbahaya: "Berbahaya",
  campuran: "Campuran",
  lainnya: "Lainnya",
};

const statusTone: Record<ReportStatus, BadgeTone> = {
  menunggu: "red",
  terverifikasi: "blue",
  diproses: "blue",
  selesai: "green",
};

const statusLabel: Record<ReportStatus, string> = {
  menunggu: "Menunggu",
  terverifikasi: "Terverifikasi",
  diproses: "Diproses",
  selesai: "Selesai",
};

const nextStatus: Partial<Record<ReportStatus, { label: string; status: ReportStatus }>> = {
  menunggu: { label: "Verifikasi Laporan", status: "terverifikasi" },
  terverifikasi: { label: "Mulai Diproses", status: "diproses" },
  diproses: { label: "Tandai Selesai", status: "selesai" },
};

export function ReportsPage() {
  const [page, setPage] = useState(1);
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [wasteType, setWasteType] = useState("");
  const [districtId, setDistrictId] = useState("");

  const search = useTopbarSearch();
  const { data: districts } = useDistricts();

  const params = {
    search,
    status,
    waste_type: wasteType,
    district_id: districtId,
    date_from: date ? `${date} 00:00:00` : undefined,
    date_to: date ? `${date} 23:59:59` : undefined,
    page,
    limit: 10,
  };
  const reportsQuery = useReportsQuery(params);
  const statsQuery = useReportStatsQuery();
  const updateStatus = useUpdateReportStatus();

  const stats = statsQuery.data;
  const pageData = reportsQuery.data;

  function resetFilters() {
    setDate("");
    setStatus("");
    setWasteType("");
    setDistrictId("");
    setPage(1);
  }

  function exportRows() {
    const rows = pageData?.items ?? [];
    return rows.map((r) => ({
      "ID Laporan": r.report_code,
      Pelapor: r.reporter?.full_name ?? "-",
      "Jenis Sampah": wasteTypeLabel[r.waste_type],
      Lokasi: r.location_name || "-",
      Tanggal: new Date(r.created_at).toLocaleString("id-ID"),
      Status: statusLabel[r.status],
    }));
  }

  function handleExportExcel() {
    const rows = exportRows();
    if (rows.length === 0) return;
    downloadCsv(`laporan-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }

  function handleExportPdf() {
    const rows = exportRows();
    if (rows.length === 0) return;
    downloadPdf(
      `laporan-${new Date().toISOString().slice(0, 10)}.pdf`,
      "Manajemen Laporan - Bali Resik",
      Object.keys(rows[0]),
      rows.map((r) => Object.values(r)),
    );
  }

  const columns: DataTableColumn<Report>[] = [
    { key: "code", header: "ID Laporan", render: (r) => <span className="font-semibold text-brand-700">{r.report_code}</span> },
    {
      key: "reporter",
      header: "Pelapor",
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            {(r.reporter?.full_name ?? "?").slice(0, 2).toUpperCase()}
          </span>
          <span className="text-gray-700">{r.reporter?.full_name ?? "-"}</span>
        </div>
      ),
    },
    {
      key: "wasteType",
      header: "Jenis Sampah",
      render: (r) => <StatusBadge label={wasteTypeLabel[r.waste_type]} tone={wasteTypeTone[r.waste_type]} dot={false} />,
    },
    { key: "location", header: "Lokasi", render: (r) => <span className="text-gray-600">{r.location_name || "-"}</span> },
    { key: "date", header: "Tanggal", render: (r) => <span className="text-gray-500">{new Date(r.created_at).toLocaleString("id-ID")}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge label={statusLabel[r.status]} tone={statusTone[r.status]} /> },
    {
      key: "action",
      header: "Aksi",
      render: (r) => {
        const next = nextStatus[r.status];
        return (
          <ActionMenu
            items={
              next
                ? [{ label: next.label, onClick: () => updateStatus.mutate({ id: r.id, status: next.status }) }]
                : [{ label: "Tidak ada aksi lanjutan", onClick: () => {} }]
            }
          />
        );
      },
    },
  ];

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
          <Button variant="secondary" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4" />
            Ekspor Excel
          </Button>
          <Button onClick={handleExportPdf}>
            <FileDown className="h-4 w-4" />
            Ekspor PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} iconClassName="bg-brand-50 text-brand-700" label="Total Laporan" value={stats?.total ?? "-"} />
        <StatCard
          icon={FileWarning}
          iconClassName="bg-red-50 text-red-600"
          label="Menunggu Verifikasi"
          value={stats?.menunggu_verifikasi ?? "-"}
        />
        <StatCard icon={Zap} iconClassName="bg-blue-50 text-blue-600" label="Sedang Diproses" value={stats?.sedang_diproses ?? "-"} />
        <StatCard icon={CheckCircle2} iconClassName="bg-brand-50 text-brand-700" label="Laporan Selesai" value={stats?.selesai ?? "-"} />
      </div>

      <FilterBar
        title="Filter Lanjutan"
        actions={
          <button type="button" onClick={resetFilters} className="text-sm font-medium text-brand-700 hover:underline">
            Hapus Semua
          </button>
        }
      >
        <FilterField label="Tanggal Laporan">
          <Input type="date" value={date} onChange={(e) => { setDate(e.target.value); setPage(1); }} />
        </FilterField>
        <FilterField label="Status">
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">Semua Status</option>
            <option value="menunggu">Menunggu</option>
            <option value="terverifikasi">Terverifikasi</option>
            <option value="diproses">Diproses</option>
            <option value="selesai">Selesai</option>
          </Select>
        </FilterField>
        <FilterField label="Jenis Sampah">
          <Select value={wasteType} onChange={(e) => { setWasteType(e.target.value); setPage(1); }}>
            <option value="">Semua Jenis</option>
            {Object.entries(wasteTypeLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FilterField>
        <FilterField label="Wilayah / Distrik">
          <Select value={districtId} onChange={(e) => { setDistrictId(e.target.value); setPage(1); }}>
            <option value="">Seluruh Bali</option>
            {districts?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </FilterField>
      </FilterBar>

      <DataTable
        columns={columns}
        data={pageData?.items ?? []}
        rowKey={(r) => r.id}
        page={page}
        pageSize={10}
        totalItems={pageData?.total_items ?? 0}
        onPageChange={setPage}
        isLoading={reportsQuery.isLoading}
        emptyMessage="Belum ada laporan yang cocok dengan filter ini."
      />
    </div>
  );
}
