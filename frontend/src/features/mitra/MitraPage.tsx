import { useEffect, useState } from "react";
import { Users2, BadgeCheck, Ban, ClipboardList, Download, UserPlus, Star, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { StatusBadge, type BadgeTone } from "@/components/ui/StatusBadge";
import {
  useMitraQuery,
  useMitraStatsQuery,
  useCreateMitra,
  useUpdateMitra,
  useUpdateMitraStatus,
  useDeleteMitra,
  type MitraInput,
} from "@/features/mitra/api/useMitra";
import { MitraFormModal } from "@/features/mitra/components/MitraFormModal";
import type { Mitra, MitraServiceType, MitraStatus } from "@/types/mitra";

type MitraTab = "semua" | "aktif" | "verifikasi" | "nonaktif";

const tabs: { key: MitraTab; label: string; status: string }[] = [
  { key: "semua", label: "Semua", status: "" },
  { key: "aktif", label: "Aktif", status: "active" },
  { key: "verifikasi", label: "Verifikasi", status: "pending_verification" },
  { key: "nonaktif", label: "Nonaktif", status: "inactive" },
];

const serviceTypeTone: Record<MitraServiceType, BadgeTone> = { rutin: "blue", on_demand: "purple" };
const serviceTypeLabel: Record<MitraServiceType, string> = { rutin: "Pick-up Rutin", on_demand: "Pick-Up On-Demand" };
const statusTone: Record<MitraStatus, BadgeTone> = { active: "green", inactive: "gray", pending_verification: "amber" };
const statusLabel: Record<MitraStatus, string> = { active: "Aktif", inactive: "Nonaktif", pending_verification: "Verifikasi" };

export function MitraPage() {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<MitraTab>("semua");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMitra, setEditingMitra] = useState<Mitra | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const activeTab = tabs.find((t) => t.key === tab)!;
  const params = { search, status: activeTab.status, page, limit: 10 };
  const mitraQuery = useMitraQuery(params);
  const statsQuery = useMitraStatsQuery();

  const createMitra = useCreateMitra();
  const updateMitra = useUpdateMitra();
  const updateStatus = useUpdateMitraStatus();
  const deleteMitra = useDeleteMitra();

  const stats = statsQuery.data;
  const pageData = mitraQuery.data;

  function openCreate() {
    setEditingMitra(null);
    setModalOpen(true);
  }

  function openEdit(mitra: Mitra) {
    setEditingMitra(mitra);
    setModalOpen(true);
  }

  function handleSubmit(input: MitraInput) {
    if (editingMitra) {
      updateMitra.mutate({ id: editingMitra.id, input }, { onSuccess: () => setModalOpen(false) });
    } else {
      createMitra.mutate(input, { onSuccess: () => setModalOpen(false) });
    }
  }

  function handleDelete(mitra: Mitra) {
    if (confirm(`Hapus mitra "${mitra.name}"? Tindakan ini tidak bisa dibatalkan.`)) {
      deleteMitra.mutate(mitra.id);
    }
  }

  const columns: DataTableColumn<Mitra>[] = [
    {
      key: "name",
      header: "Nama Mitra",
      render: (m) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            {m.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <p className="font-medium text-gray-900">{m.name}</p>
            <p className="text-xs text-gray-400">{m.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
      ),
    },
    { key: "serviceArea", header: "Wilayah Operasi", render: (m) => <span className="text-gray-600">{m.service_area_district?.name ?? "-"}</span> },
    {
      key: "serviceType",
      header: "Jenis Layanan",
      render: (m) => <StatusBadge label={serviceTypeLabel[m.service_type]} tone={serviceTypeTone[m.service_type]} dot={false} />,
    },
    { key: "totalTasks", header: "Jumlah Tugas", render: (m) => <span className="text-gray-700">{m.total_tasks.toLocaleString("id-ID")}</span> },
    {
      key: "rating",
      header: "Rating",
      render: (m) => (
        <span className="flex items-center gap-1 text-gray-700">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          {m.rating_avg}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (m) => (
        <button type="button" onClick={() => updateStatus.mutate({ id: m.id, status: m.status === "active" ? "inactive" : "active" })}>
          <StatusBadge label={statusLabel[m.status]} tone={statusTone[m.status]} />
        </button>
      ),
    },
    {
      key: "action",
      header: "Aksi",
      render: (m) => (
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => openEdit(m)} className="text-gray-400 hover:text-brand-700" aria-label="Edit mitra">
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => handleDelete(m)} className="text-gray-400 hover:text-red-600" aria-label="Hapus mitra">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Mitra</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola seluruh mitra pengumpul dan pengolah sampah di wilayah Bali.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary">
            <Download className="h-4 w-4" />
            Ekspor
          </Button>
          <Button onClick={openCreate}>
            <UserPlus className="h-4 w-4" />
            Tambah Mitra
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <Users2 className="h-4.5 w-4.5" />
          </span>
          <p className="mt-3 text-sm text-gray-500">Total Mitra</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.total ?? "-"}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <BadgeCheck className="h-4.5 w-4.5" />
          </span>
          <p className="mt-3 text-sm text-gray-500">Mitra Aktif</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.aktif ?? "-"}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <Ban className="h-4.5 w-4.5" />
          </span>
          <p className="mt-3 text-sm text-gray-500">Tidak Aktif</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.tidak_aktif ?? "-"}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <ClipboardList className="h-4.5 w-4.5" />
          </span>
          <p className="mt-3 text-sm text-gray-500">Verifikasi Baru</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.verifikasi_baru ?? "-"}</p>
        </div>
      </div>

      <div className="max-w-md">
        <Input placeholder="Cari mitra berdasarkan nama atau wilayah..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-gray-900">Daftar Mitra Terdaftar</p>
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5 text-xs">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => { setTab(t.key); setPage(1); }}
                className={`rounded-md px-3 py-1.5 font-medium ${tab === t.key ? "bg-brand-700 text-white" : "text-gray-500 hover:bg-gray-50"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={pageData?.items ?? []}
          rowKey={(m) => m.id}
          page={page}
          pageSize={10}
          totalItems={pageData?.total_items ?? 0}
          onPageChange={setPage}
          isLoading={mitraQuery.isLoading}
          emptyMessage="Belum ada mitra pada kategori ini."
        />
      </div>

      <MitraFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createMitra.isPending || updateMitra.isPending}
        initialMitra={editingMitra}
        errorMessage={createMitra.isError || updateMitra.isError ? "Gagal menyimpan mitra. Periksa kembali data yang dimasukkan." : null}
      />
    </div>
  );
}
