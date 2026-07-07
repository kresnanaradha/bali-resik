import { useEffect, useState } from "react";
import { Users, User as UserIcon, Truck, ShieldCheck, UserPlus, Search } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { StatusBadge, type BadgeTone } from "@/components/ui/StatusBadge";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { useDistricts } from "@/hooks/useDistricts";
import {
  useUsersQuery,
  useUserStatsQuery,
  useCreateUser,
  useUpdateUser,
  useUpdateUserStatus,
  useDeleteUser,
  type UserInput,
} from "@/features/users/api/useUsers";
import { UserFormModal } from "@/features/users/components/UserFormModal";
import type { User, UserRole, UserStatus } from "@/types/user";

const roleTone: Record<UserRole, BadgeTone> = { warga: "blue", mitra: "amber", admin: "red" };
const roleLabel: Record<UserRole, string> = { warga: "Warga", mitra: "Mitra", admin: "Admin" };

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [status, setStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const params = { search, role, district_id: districtId, status, page, limit: 10 };
  const usersQuery = useUsersQuery(params);
  const statsQuery = useUserStatsQuery();
  const { data: districts } = useDistricts();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const updateStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();

  const stats = statsQuery.data;
  const pageData = usersQuery.data;

  function openCreate() {
    setEditingUser(null);
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setModalOpen(true);
  }

  function handleSubmit(input: UserInput) {
    if (editingUser) {
      updateUser.mutate(
        { id: editingUser.id, input },
        { onSuccess: () => setModalOpen(false) },
      );
    } else {
      createUser.mutate(input, { onSuccess: () => setModalOpen(false) });
    }
  }

  function handleToggleStatus(user: User) {
    const next: UserStatus = user.status === "active" ? "suspended" : "active";
    updateStatus.mutate({ id: user.id, status: next });
  }

  function handleDelete(user: User) {
    if (confirm(`Hapus pengguna "${user.full_name}"? Tindakan ini tidak bisa dibatalkan.`)) {
      deleteUser.mutate(user.id);
    }
  }

  const columns: DataTableColumn<User>[] = [
    {
      key: "name",
      header: "Nama & Email",
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            {initialsOf(u.full_name) || "?"}
          </span>
          <div>
            <p className="font-medium text-gray-900">{u.full_name}</p>
            <p className="text-xs text-gray-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: "phone", header: "Nomor Telepon", render: (u) => <span className="text-gray-600">{u.phone || "-"}</span> },
    { key: "role", header: "Peran", render: (u) => <StatusBadge label={roleLabel[u.role]} tone={roleTone[u.role]} dot={false} /> },
    { key: "region", header: "Wilayah", render: (u) => <span className="text-gray-600">{u.district?.name ?? "-"}</span> },
    {
      key: "joinedDate",
      header: "Tanggal Bergabung",
      render: (u) => <span className="text-gray-500">{new Date(u.joined_at).toLocaleDateString("id-ID")}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <StatusBadge
          label={u.status === "active" ? "Aktif" : u.status === "suspended" ? "Ditangguhkan" : "Nonaktif"}
          tone={u.status === "active" ? "green" : "red"}
        />
      ),
    },
    {
      key: "action",
      header: "Aksi",
      render: (u) => (
        <ActionMenu
          items={[
            { label: "Edit", onClick: () => openEdit(u) },
            { label: u.status === "active" ? "Tangguhkan" : "Aktifkan", onClick: () => handleToggleStatus(u) },
            { label: "Hapus", onClick: () => handleDelete(u), tone: "danger" },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola profil warga, lisensi mitra, dan akses admin.</p>
        </div>
        <Button onClick={openCreate}>
          <UserPlus className="h-4 w-4" />
          Tambah Pengguna Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} iconClassName="bg-brand-50 text-brand-700" label="Total Pengguna" value={stats?.total ?? "-"} />
        <StatCard icon={UserIcon} iconClassName="bg-blue-50 text-blue-600" label="Warga" value={stats?.warga ?? "-"} />
        <StatCard icon={Truck} iconClassName="bg-amber-50 text-amber-600" label="Mitra" value={stats?.mitra ?? "-"} />
        <StatCard icon={ShieldCheck} iconClassName="bg-red-50 text-red-600" label="Admin" value={stats?.admin ?? "-"} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari nama, email, atau nomor telepon..."
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">PERAN</span>
            <Select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="w-32">
              <option value="">Semua</option>
              <option value="warga">Warga</option>
              <option value="mitra">Mitra</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">WILAYAH</span>
            <Select value={districtId} onChange={(e) => { setDistrictId(e.target.value); setPage(1); }} className="w-36">
              <option value="">Semua</option>
              {districts?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">STATUS</span>
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-32">
              <option value="">Semua</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
              <option value="suspended">Ditangguhkan</option>
            </Select>
          </div>
          <button
            type="button"
            onClick={() => { setSearchInput(""); setSearch(""); setRole(""); setDistrictId(""); setStatus(""); setPage(1); }}
            className="ml-auto text-sm font-medium text-brand-700 hover:underline"
          >
            Atur Ulang
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={pageData?.items ?? []}
        rowKey={(u) => u.id}
        page={page}
        pageSize={10}
        totalItems={pageData?.total_items ?? 0}
        onPageChange={setPage}
        isLoading={usersQuery.isLoading}
        emptyMessage="Belum ada pengguna terdaftar."
      />

      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createUser.isPending || updateUser.isPending}
        initialUser={editingUser}
        errorMessage={
          createUser.isError || updateUser.isError ? "Gagal menyimpan pengguna. Periksa kembali data yang dimasukkan." : null
        }
      />
    </div>
  );
}
