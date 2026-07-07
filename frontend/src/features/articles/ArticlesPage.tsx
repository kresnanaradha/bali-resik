import { useState } from "react";
import { Newspaper, Globe2, FileEdit, Eye, PenLine, MoreVertical, Info } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { StatusBadge, type BadgeTone } from "@/components/ui/StatusBadge";
import { articles, articleStats, type Article } from "@/features/articles/api/mockData";

const categoryTone: Record<Article["category"], BadgeTone> = {
  edukasi: "green",
  lifestyle: "purple",
  regulasi: "amber",
};

const categoryLabel: Record<Article["category"], string> = {
  edukasi: "EDUKASI",
  lifestyle: "LIFESTYLE",
  regulasi: "REGULASI",
};

const columns: DataTableColumn<Article>[] = [
  {
    key: "thumbnail",
    header: "Thumbnail",
    render: (a) => <div className={`h-10 w-14 rounded-lg bg-gradient-to-br ${a.thumbnailGradient}`} />,
  },
  { key: "title", header: "Judul Artikel", render: (a) => <span className="font-medium text-gray-900">{a.title}</span> },
  {
    key: "category",
    header: "Kategori",
    render: (a) => <StatusBadge label={categoryLabel[a.category]} tone={categoryTone[a.category]} dot={false} />,
  },
  {
    key: "author",
    header: "Penulis",
    render: (a) => (
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
          {a.authorInitials}
        </span>
        <span className="text-gray-700">{a.authorName}</span>
      </div>
    ),
  },
  { key: "date", header: "Tanggal", render: (a) => <span className="text-gray-500">{a.date}</span> },
  { key: "views", header: "Dilihat", render: (a) => <span className="text-gray-600">{a.views}</span> },
  {
    key: "action",
    header: "Aksi",
    render: () => (
      <button type="button" className="text-gray-400 hover:text-gray-600" aria-label="Menu aksi">
        <MoreVertical className="h-4 w-4" />
      </button>
    ),
  },
];

export function ArticlesPage() {
  const [page, setPage] = useState(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Artikel</h1>
          <p className="mt-1 text-sm text-gray-500">
            Buat dan kelola artikel edukasi untuk masyarakat Bali Resik.
          </p>
        </div>
        <Button>
          <PenLine className="h-4 w-4" />
          Tulis Artikel Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Newspaper}
          iconClassName="bg-brand-50 text-brand-700"
          label="Total Artikel"
          value={articleStats.total.value}
          badge={{ text: `+${articleStats.total.trend}%`, tone: "up" }}
        />
        <StatCard
          icon={Globe2}
          iconClassName="bg-blue-50 text-blue-600"
          label="Dipublikasikan"
          value={articleStats.published.value}
          badge={{ text: "Aktif", tone: "success" }}
        />
        <StatCard
          icon={FileEdit}
          iconClassName="bg-amber-50 text-amber-600"
          label="Draft Artikel"
          value={articleStats.draft.value}
          badge={{ text: "Pending", tone: "warning" }}
        />
        <StatCard
          icon={Eye}
          iconClassName="bg-brand-50 text-brand-700"
          label="Total Pembaca"
          value={articleStats.totalReaders.value.toLocaleString("id-ID")}
          badge={{ text: articleStats.totalReaders.shortLabel, tone: "up" }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <Select defaultValue="" className="w-40">
          <option value="">Status: Semua</option>
          <option value="published">Dipublikasikan</option>
          <option value="draft">Draft</option>
        </Select>
        <Select defaultValue="" className="w-40">
          <option value="">Kategori: Semua</option>
          <option value="edukasi">Edukasi</option>
          <option value="lifestyle">Lifestyle</option>
          <option value="regulasi">Regulasi</option>
        </Select>
        <Select defaultValue="" className="w-40">
          <option value="">Penulis: Semua</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={articles}
        rowKey={(a) => a.id}
        page={page}
        pageSize={10}
        totalItems={articleStats.total.value}
        onPageChange={setPage}
      />

      <div className="flex gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <Info className="h-4 w-4 shrink-0 text-gray-500" />
        <div>
          <p className="text-sm font-semibold text-gray-800">Integrasi Otomatis</p>
          <p className="mt-0.5 text-xs text-gray-500">
            Artikel yang dipublikasikan akan otomatis muncul pada menu Edukasi di aplikasi Bali Resik dan dapat
            diakses masyarakat secara real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
