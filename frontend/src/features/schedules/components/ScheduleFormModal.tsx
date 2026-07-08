import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useDistricts } from "@/hooks/useDistricts";
import { useTpsLocations } from "@/hooks/useTpsLocations";
import type { ScheduleInput } from "@/features/schedules/api/useSchedules";
import type { Schedule } from "@/types/schedule";

interface ScheduleFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: ScheduleInput) => void;
  isSubmitting?: boolean;
  initialSchedule?: Schedule | null;
  errorMessage?: string | null;
}

const DAY_LABELS = [
  { value: 1, label: "Sen" },
  { value: 2, label: "Sel" },
  { value: 3, label: "Rab" },
  { value: 4, label: "Kam" },
  { value: 5, label: "Jum" },
  { value: 6, label: "Sab" },
  { value: 0, label: "Min" },
];

const emptyForm: ScheduleInput = {
  tps_location_id: "",
  district_id: "",
  kelurahan: "",
  waste_type: "organik",
  days_of_week: [],
  start_time: "08:00",
  end_time: "11:00",
};

export function ScheduleFormModal({ open, onClose, onSubmit, isSubmitting, initialSchedule, errorMessage }: ScheduleFormModalProps) {
  const { data: districts } = useDistricts();
  const { data: tpsLocations } = useTpsLocations();
  const [form, setForm] = useState<ScheduleInput>(emptyForm);

  useEffect(() => {
    if (initialSchedule) {
      setForm({
        tps_location_id: initialSchedule.tps_location_id,
        district_id: initialSchedule.district_id,
        kelurahan: initialSchedule.kelurahan,
        waste_type: initialSchedule.waste_type,
        days_of_week: initialSchedule.days_of_week,
        start_time: initialSchedule.start_time.slice(0, 5),
        end_time: initialSchedule.end_time.slice(0, 5),
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialSchedule, open]);

  function toggleDay(day: number) {
    setForm((f) => ({
      ...f,
      days_of_week: f.days_of_week.includes(day) ? f.days_of_week.filter((d) => d !== day) : [...f.days_of_week, day],
    }));
  }

  const canSubmit =
    form.tps_location_id && form.district_id && form.kelurahan && form.days_of_week.length > 0 && form.start_time && form.end_time;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialSchedule ? "Edit Jadwal" : "Buat Jadwal Baru"}
      description={initialSchedule ? "Perbarui jadwal pengangkutan." : "Buat jadwal pengangkutan rutin baru (dimulai sebagai draft)."}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button disabled={!canSubmit || isSubmitting} onClick={() => onSubmit(form)}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {errorMessage && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">TPS3R</label>
          <Select value={form.tps_location_id} onChange={(e) => setForm((f) => ({ ...f, tps_location_id: e.target.value }))}>
            <option value="">Pilih TPS3R</option>
            {tpsLocations?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">Kecamatan</label>
            <Select value={form.district_id} onChange={(e) => setForm((f) => ({ ...f, district_id: e.target.value }))}>
              <option value="">Pilih Kecamatan</option>
              {districts?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">Kelurahan</label>
            <Input value={form.kelurahan} onChange={(e) => setForm((f) => ({ ...f, kelurahan: e.target.value }))} placeholder="Nama kelurahan" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Jenis Sampah</label>
          <Select value={form.waste_type} onChange={(e) => setForm((f) => ({ ...f, waste_type: e.target.value }))}>
            <option value="organik">Organik</option>
            <option value="anorganik">Anorganik</option>
            <option value="plastik">Plastik</option>
            <option value="kertas_kardus">Kertas/Kardus</option>
            <option value="logam">Logam</option>
            <option value="berbahaya">Berbahaya</option>
            <option value="campuran">Campuran</option>
            <option value="lainnya">Lainnya</option>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Hari</label>
          <div className="flex flex-wrap gap-1.5">
            {DAY_LABELS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => toggleDay(d.value)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${
                  form.days_of_week.includes(d.value) ? "bg-brand-700 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">Jam Mulai</label>
            <Input type="time" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">Jam Selesai</label>
            <Input type="time" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
