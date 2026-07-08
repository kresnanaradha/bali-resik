export interface TagStyle {
  label: string;
  className: string;
  dot: string;
}

export const wasteTagStyle: Record<string, TagStyle> = {
  organik: { label: "Organik", className: "bg-brand-50 text-brand-700", dot: "bg-brand-600" },
  anorganik: { label: "Anorganik", className: "bg-blue-50 text-blue-600", dot: "bg-blue-500" },
  plastik: { label: "Plastik", className: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
  kertas_kardus: { label: "Kertas/Kardus", className: "bg-blue-50 text-blue-600", dot: "bg-blue-500" },
  logam: { label: "Logam", className: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
  berbahaya: { label: "Berbahaya", className: "bg-red-50 text-red-600", dot: "bg-red-500" },
  campuran: { label: "Campuran", className: "bg-amber-50 text-amber-600", dot: "bg-amber-500" },
  lainnya: { label: "Lainnya", className: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
};

export const cancelledTagStyle: TagStyle = { label: "Dibatalkan", className: "bg-red-50 text-red-600", dot: "bg-red-500" };
