import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useDistricts } from "@/hooks/useDistricts";
import type { MitraInput } from "@/features/mitra/api/useMitra";
import type { Mitra } from "@/types/mitra";

interface MitraFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: MitraInput) => void;
  isSubmitting?: boolean;
  initialMitra?: Mitra | null;
  errorMessage?: string | null;
}

const emptyForm: MitraInput = {
  name: "",
  service_area_district_id: "",
  service_type: "on_demand",
  phone: "",
  email: "",
  address: "",
};

export function MitraFormModal({ open, onClose, onSubmit, isSubmitting, initialMitra, errorMessage }: MitraFormModalProps) {
  const { data: districts } = useDistricts();
  const [form, setForm] = useState<MitraInput>(emptyForm);

  useEffect(() => {
    if (initialMitra) {
      setForm({
        name: initialMitra.name,
        service_area_district_id: initialMitra.service_area_district_id ?? "",
        service_type: initialMitra.service_type,
        phone: initialMitra.phone,
        email: initialMitra.email,
        address: initialMitra.address,
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialMitra, open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialMitra ? "Edit Mitra" : "Tambah Mitra Baru"}
      description={initialMitra ? "Perbarui data mitra." : "Daftarkan mitra pengangkut sampah baru."}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={() => onSubmit({ ...form, service_area_district_id: form.service_area_district_id || null })}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {errorMessage && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Nama Mitra</label>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nama perusahaan/mitra" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">Jenis Layanan</label>
            <Select
              value={form.service_type}
              onChange={(e) => setForm((f) => ({ ...f, service_type: e.target.value as MitraInput["service_type"] }))}
            >
              <option value="on_demand">Pick-Up On-Demand</option>
              <option value="rutin">Pick-up Rutin</option>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">Wilayah Operasi</label>
            <Select
              value={form.service_area_district_id ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, service_area_district_id: e.target.value }))}
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">Telepon</label>
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+62 8xx-xxxx-xxxx" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">Email</label>
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="mitra@contoh.com" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Alamat</label>
          <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Alamat operasional" />
        </div>
      </div>
    </Modal>
  );
}
