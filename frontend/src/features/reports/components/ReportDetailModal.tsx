import { useState } from "react";
import { MapPin, ImageOff, ChevronLeft, ChevronRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge, type BadgeTone } from "@/components/ui/StatusBadge";
import type { Report, ReportPriority } from "@/types/report";

interface ReportDetailModalProps {
  report: Report | null;
  onClose: () => void;
  wasteTypeLabel: Record<string, string>;
  wasteTypeTone: Record<string, BadgeTone>;
  statusLabel: Record<string, string>;
  statusTone: Record<string, BadgeTone>;
}

const priorityLabel: Record<ReportPriority, string> = {
  low: "Rendah",
  medium: "Sedang",
  high: "Tinggi",
};

const priorityTone: Record<ReportPriority, BadgeTone> = {
  low: "gray",
  medium: "amber",
  high: "red",
};

export function ReportDetailModal({
  report,
  onClose,
  wasteTypeLabel,
  wasteTypeTone,
  statusLabel,
  statusTone,
}: ReportDetailModalProps) {
  const [activePhoto, setActivePhoto] = useState(0);

  if (!report) return null;

  const photos = report.photo_urls ?? [];
  const hasCoords = report.latitude !== 0 || report.longitude !== 0;

  function showPhoto(index: number) {
    setActivePhoto((index + photos.length) % photos.length);
  }

  return (
    <Modal
      open={!!report}
      onClose={() => {
        setActivePhoto(0);
        onClose();
      }}
      title={`Detail Laporan ${report.report_code}`}
      description={report.location_name || "Lokasi tidak diketahui"}
      maxWidthClassName="max-w-2xl"
    >
      <div className="space-y-5">
        <div>
          {photos.length > 0 ? (
            <div className="relative">
              <img
                src={photos[activePhoto]}
                alt={`Foto laporan ${report.report_code} ${activePhoto + 1}`}
                className="h-64 w-full rounded-lg object-cover"
              />
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Foto sebelumnya"
                    onClick={() => showPhoto(activePhoto - 1)}
                    className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Foto berikutnya"
                    onClick={() => showPhoto(activePhoto + 1)}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Lihat foto ke-${i + 1}`}
                        onClick={() => showPhoto(i)}
                        className={`h-1.5 w-1.5 rounded-full ${i === activePhoto ? "bg-white" : "bg-white/50"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg bg-gray-50 text-gray-400">
              <ImageOff className="h-8 w-8" />
              <span className="text-sm">Tidak ada foto untuk laporan ini</span>
            </div>
          )}
          {photos.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {photos.map((url, i) => (
                <button
                  key={url + i}
                  type="button"
                  onClick={() => showPhoto(i)}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 ${
                    i === activePhoto ? "border-brand-600" : "border-transparent"
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Status</p>
            <div className="mt-1">
              <StatusBadge label={statusLabel[report.status]} tone={statusTone[report.status]} />
            </div>
          </div>
          <div>
            <p className="text-gray-400">Prioritas</p>
            <div className="mt-1">
              <StatusBadge label={priorityLabel[report.priority]} tone={priorityTone[report.priority]} dot={false} />
            </div>
          </div>
          <div>
            <p className="text-gray-400">Jenis Sampah</p>
            <div className="mt-1">
              <StatusBadge label={wasteTypeLabel[report.waste_type]} tone={wasteTypeTone[report.waste_type]} dot={false} />
            </div>
          </div>
          <div>
            <p className="text-gray-400">Tanggal Lapor</p>
            <p className="mt-1 font-medium text-gray-700">
              {new Date(report.created_at).toLocaleString("id-ID")}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Pelapor</p>
            <p className="mt-1 font-medium text-gray-700">{report.reporter?.full_name ?? "-"}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-400">Deskripsi</p>
          <p className="mt-1 text-sm text-gray-700">{report.description || "Tidak ada deskripsi."}</p>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-sm text-gray-400">
            <MapPin className="h-4 w-4" /> Lokasi
          </p>
          <p className="mt-1 text-sm text-gray-700">{report.location_name || "-"}</p>
          {hasCoords && (
            <a
              href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-sm text-brand-700 hover:underline"
            >
              Lihat di peta ({report.latitude.toFixed(6)}, {report.longitude.toFixed(6)})
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
}
