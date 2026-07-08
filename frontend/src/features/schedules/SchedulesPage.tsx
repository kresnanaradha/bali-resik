import { useEffect, useState } from "react";
import { CheckCircle2, CalendarClock, MapPin, CalendarRange, Plus, RotateCcw, Download, Info, Recycle } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { FilterBar, FilterField } from "@/components/ui/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { StatusBadge, type BadgeTone } from "@/components/ui/StatusBadge";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { useDistricts } from "@/hooks/useDistricts";
import { useTpsLocations } from "@/hooks/useTpsLocations";
import { useTopbarSearch } from "@/hooks/useTopbarSearch";
import {
  useSchedulesQuery,
  useScheduleStatsQuery,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useCopySchedule,
  useUpdateScheduleStatus,
  useBulkUpdateScheduleStatus,
  type ScheduleInput,
} from "@/features/schedules/api/useSchedules";
import { ScheduleCalendar } from "@/features/schedules/components/ScheduleCalendar";
import { ScheduleFormModal } from "@/features/schedules/components/ScheduleFormModal";
import { wasteTagStyle } from "@/features/schedules/api/scheduleTagStyle";
import { downloadCsv } from "@/lib/exportCsv";
import type { Schedule, ScheduleStatus } from "@/types/schedule";

const statusTone: Record<ScheduleStatus, BadgeTone> = { active: "green", draft: "gray", closed: "red" };
const statusLabel: Record<ScheduleStatus, string> = { active: "Aktif", draft: "Draft", closed: "Ditutup" };
const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const nextStatus: Record<ScheduleStatus, { label: string; status: ScheduleStatus }> = {
  draft: { label: "Aktifkan", status: "active" },
  active: { label: "Tutup", status: "closed" },
  closed: { label: "Buka Kembali", status: "active" },
};

export function SchedulesPage() {
  const [page, setPage] = useState(1);
  const [districtId, setDistrictId] = useState("");
  const [kelurahan, setKelurahan] = useState("");
  const [tpsLocationId, setTpsLocationId] = useState("");
  const [wasteType, setWasteType] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<ScheduleStatus>("active");

  const search = useTopbarSearch();
  const { data: districts } = useDistricts();
  const { data: tpsLocations } = useTpsLocations();

  const params = {
    search,
    kecamatan: districtId,
    kelurahan,
    tps_location_id: tpsLocationId,
    waste_type: wasteType,
    page,
    limit: 10,
  };
  const schedulesQuery = useSchedulesQuery(params);
  const statsQuery = useScheduleStatsQuery();

  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();
  const copySchedule = useCopySchedule();
  const updateStatus = useUpdateScheduleStatus();
  const bulkUpdate = useBulkUpdateScheduleStatus();

  const stats = statsQuery.data;
  const pageData = schedulesQuery.data;

  useEffect(() => {
    setSelectedIds(new Set());
  }, [pageData]);

  function resetFilters() {
    setDistrictId("");
    setKelurahan("");
    setTpsLocationId("");
    setWasteType("");
    setPage(1);
  }

  function openCreate() {
    setEditingSchedule(null);
    setModalOpen(true);
  }

  function openEdit(schedule: Schedule) {
    setEditingSchedule(schedule);
    setModalOpen(true);
  }

  function handleSubmit(input: ScheduleInput) {
    if (editingSchedule) {
      updateSchedule.mutate({ id: editingSchedule.id, input }, { onSuccess: () => setModalOpen(false) });
    } else {
      createSchedule.mutate(input, { onSuccess: () => setModalOpen(false) });
    }
  }

  function handleDelete(schedule: Schedule) {
    if (confirm(`Hapus jadwal "${schedule.schedule_code}"? Tindakan ini tidak bisa dibatalkan.`)) {
      deleteSchedule.mutate(schedule.id);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    const items = pageData?.items ?? [];
    setSelectedIds((prev) => (prev.size === items.length ? new Set() : new Set(items.map((s) => s.id))));
  }

  function applyBulkUpdate() {
    bulkUpdate.mutate({ ids: [...selectedIds], status: bulkStatus }, { onSuccess: () => setSelectedIds(new Set()) });
  }

  function handleExport() {
    const rows = pageData?.items ?? [];
    if (rows.length === 0) return;
    downloadCsv(`jadwal-${new Date().toISOString().slice(0, 10)}.csv`, rows.map((s) => ({
      "ID Jadwal": s.schedule_code,
      TPS3R: s.tps_location?.name ?? "-",
      Kecamatan: s.district?.name ?? "-",
      Kelurahan: s.kelurahan,
      "Jenis Sampah": wasteTagStyle[s.waste_type]?.label ?? s.waste_type,
      Hari: s.days_of_week.map((d) => dayNames[d]).join(", "),
      "Jam Operasional": `${s.start_time.slice(0, 5)} - ${s.end_time.slice(0, 5)}`,
      Status: statusLabel[s.status],
    })));
  }

  const columns: DataTableColumn<Schedule>[] = [
    {
      key: "select",
      header: "",
      className: "w-8",
      render: (s) => (
        <input
          type="checkbox"
          checked={selectedIds.has(s.id)}
          onChange={() => toggleSelect(s.id)}
          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
        />
      ),
    },
    { key: "code", header: "ID Jadwal", render: (s) => <span className="font-semibold text-brand-700">{s.schedule_code}</span> },
    { key: "tps", header: "TPS3R", render: (s) => <span className="font-medium text-gray-800">{s.tps_location?.name ?? "-"}</span> },
    { key: "kecamatan", header: "Kecamatan", render: (s) => <span className="text-gray-600">{s.district?.name ?? "-"}</span> },
    { key: "kelurahan", header: "Kelurahan", render: (s) => <span className="text-gray-600">{s.kelurahan}</span> },
    {
      key: "wasteType",
      header: "Jenis Sampah",
      render: (s) => {
        const style = wasteTagStyle[s.waste_type];
        return <StatusBadge label={style?.label ?? s.waste_type} tone={s.waste_type === "organik" ? "green" : s.waste_type === "anorganik" ? "blue" : "amber"} dot={false} />;
      },
    },
    { key: "days", header: "Hari", render: (s) => <span className="text-gray-600">{s.days_of_week.map((d) => dayNames[d]).join(", ")}</span> },
    { key: "hours", header: "Jam Operasional", render: (s) => <span className="text-gray-500">{s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}</span> },
    { key: "status", header: "Status", render: (s) => <StatusBadge label={statusLabel[s.status]} tone={statusTone[s.status]} /> },
    {
      key: "action",
      header: "Aksi",
      render: (s) => (
        <ActionMenu
          items={[
            { label: "Edit", onClick: () => openEdit(s) },
            { label: "Copy Jadwal", onClick: () => copySchedule.mutate(s.id) },
            { label: nextStatus[s.status].label, onClick: () => updateStatus.mutate({ id: s.id, status: nextStatus[s.status].status }) },
            { label: "Hapus", onClick: () => handleDelete(s), tone: "danger" },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Penjadwalan Pengangkutan Sampah</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola jadwal pengangkutan sampah berdasarkan wilayah dan jenis sampah.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Buat Jadwal Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CheckCircle2} iconClassName="bg-brand-50 text-brand-700" label="Total Jadwal Aktif" value={stats?.total_jadwal_aktif ?? "-"} />
        <StatCard icon={CalendarClock} iconClassName="bg-blue-50 text-blue-600" label="Jadwal Hari Ini" value={stats?.jadwal_hari_ini ?? "-"} />
        <StatCard icon={MapPin} iconClassName="bg-amber-50 text-amber-600" label="Wilayah Terlayani" value={stats?.wilayah_terlayani ?? "-"} />
        <StatCard icon={CalendarRange} iconClassName="bg-brand-50 text-brand-700" label="Jadwal Draft" value={stats?.jadwal_mendatang ?? "-"} />
      </div>

      <FilterBar
        title="Filter Jadwal"
        actions={
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <button type="button" onClick={resetFilters} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700">
              <RotateCcw className="h-3.5 w-3.5" /> Reset Filter
            </button>
            <button type="button" onClick={handleExport} className="flex items-center gap-1.5 text-brand-700 hover:underline">
              <Download className="h-3.5 w-3.5" /> Ekspor Jadwal
            </button>
          </div>
        }
      >
        <FilterField label="Kecamatan">
          <Select value={districtId} onChange={(e) => { setDistrictId(e.target.value); setPage(1); }}>
            <option value="">Semua</option>
            {districts?.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
        </FilterField>
        <FilterField label="Kelurahan">
          <input
            type="text"
            value={kelurahan}
            onChange={(e) => { setKelurahan(e.target.value); setPage(1); }}
            placeholder="Cari kelurahan..."
            className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </FilterField>
        <FilterField label="TPS3R">
          <Select value={tpsLocationId} onChange={(e) => { setTpsLocationId(e.target.value); setPage(1); }}>
            <option value="">Semua</option>
            {tpsLocations?.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        </FilterField>
        <FilterField label="Jenis Sampah">
          <Select value={wasteType} onChange={(e) => { setWasteType(e.target.value); setPage(1); }}>
            <option value="">Semua</option>
            {Object.entries(wasteTagStyle).map(([value, style]) => (
              <option key={value} value={value}>{style.label}</option>
            ))}
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
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-brand-600" /> Organik (Daur Ulang Hayati)</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Anorganik (Plastik/Logam)</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Campuran (Residu)</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Jadwal Dibatalkan</li>
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
            {tpsLocations?.length === 0 ? (
              <p className="text-sm text-gray-400">Belum ada TPS3R terdaftar.</p>
            ) : (
              <ul className="space-y-3">
                {tpsLocations?.slice(0, 3).map((tps) => (
                  <li key={tps.id} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                      <Recycle className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">{tps.name}</p>
                      <p className="text-xs text-gray-500">{tps.district?.name ?? tps.address}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-500">{tps.operating_hours}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Daftar Jadwal Pengangkutan</p>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5">
              <span className="text-xs font-medium text-brand-800">{selectedIds.size} dipilih</span>
              <Select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as ScheduleStatus)} className="h-8 py-1 text-xs">
                <option value="active">Aktifkan</option>
                <option value="draft">Jadikan Draft</option>
                <option value="closed">Tutup</option>
              </Select>
              <Button size="sm" onClick={applyBulkUpdate} disabled={bulkUpdate.isPending}>
                Terapkan
              </Button>
            </div>
          )}
          <label className="flex items-center gap-1.5 text-xs text-gray-500">
            <input
              type="checkbox"
              checked={(pageData?.items.length ?? 0) > 0 && selectedIds.size === pageData?.items.length}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            Pilih semua
          </label>
        </div>
        <DataTable
          columns={columns}
          data={pageData?.items ?? []}
          rowKey={(s) => s.id}
          page={page}
          pageSize={10}
          totalItems={pageData?.total_items ?? 0}
          onPageChange={setPage}
          isLoading={schedulesQuery.isLoading}
          emptyMessage="Belum ada jadwal yang cocok dengan filter ini."
        />
      </div>

      <ScheduleFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createSchedule.isPending || updateSchedule.isPending}
        initialSchedule={editingSchedule}
        errorMessage={createSchedule.isError || updateSchedule.isError ? "Gagal menyimpan jadwal. Periksa kembali data yang dimasukkan." : null}
      />
    </div>
  );
}
