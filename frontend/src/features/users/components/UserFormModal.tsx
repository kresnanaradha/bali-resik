import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useDistricts } from "@/hooks/useDistricts";
import type { UserInput } from "@/features/users/api/useUsers";
import type { User } from "@/types/user";

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: UserInput) => void;
  isSubmitting?: boolean;
  initialUser?: User | null;
  errorMessage?: string | null;
}

const emptyForm: UserInput = { full_name: "", email: "", phone: "", role: "warga", district_id: "" };

export function UserFormModal({ open, onClose, onSubmit, isSubmitting, initialUser, errorMessage }: UserFormModalProps) {
  const { data: districts } = useDistricts();
  const [form, setForm] = useState<UserInput>(emptyForm);

  useEffect(() => {
    if (initialUser) {
      setForm({
        full_name: initialUser.full_name,
        email: initialUser.email,
        phone: initialUser.phone,
        role: initialUser.role,
        district_id: initialUser.district_id ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialUser, open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
      description={initialUser ? "Perbarui data pengguna." : "Isi data untuk mendaftarkan pengguna baru."}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={() => onSubmit({ ...form, district_id: form.district_id || null })}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {errorMessage && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
        )}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Nama Lengkap</label>
          <Input
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            placeholder="Nama lengkap"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Email</label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="nama@contoh.com"
            disabled={!!initialUser}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Nomor Telepon</label>
          <Input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+62 8xx-xxxx-xxxx"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">Peran</label>
            <Select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserInput["role"] }))}
            >
              <option value="warga">Warga</option>
              <option value="mitra">Mitra</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">Wilayah</label>
            <Select
              value={form.district_id ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, district_id: e.target.value }))}
            >
              <option value="">Tidak ada</option>
              {districts?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </Modal>
  );
}
