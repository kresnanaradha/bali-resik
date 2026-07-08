import { useState } from "react";
import { Newspaper, Globe2, FileEdit, Eye, PenLine, Info } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { StatusBadge, type BadgeTone } from "@/components/ui/StatusBadge";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { useTopbarSearch } from "@/hooks/useTopbarSearch";
import { useAuthStore } from "@/stores/authStore";
import { useUsersQuery } from "@/features/users/api/useUsers";
import {
  useArticlesQuery,
  useArticleStatsQuery,
  useCreateArticle,
  useUpdateArticle,
  useSetArticlePublished,
  useDeleteArticle,
  type ArticleInput,
} from "@/features/articles/api/useArticles";
import { ArticleFormModal } from "@/features/articles/components/ArticleFormModal";
import type { Article } from "@/types/article";

const categoryTone: Record<string, BadgeTone> = { edukasi: "green", lifestyle: "purple", regulasi: "amber" };
const categoryLabel: Record<string, string> = { edukasi: "EDUKASI", lifestyle: "LIFESTYLE", regulasi: "REGULASI" };

const thumbnailGradients = ["from-brand-700 to-brand-400", "from-amber-500 to-orange-300", "from-emerald-800 to-teal-500", "from-blue-700 to-blue-400"];
function gradientFor(id: string) {
  const idx = id.charCodeAt(0) % thumbnailGradients.length;
  return thumbnailGradients[idx];
}

export function ArticlesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const search = useTopbarSearch();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { data: admins } = useUsersQuery({ role: "admin", page: 1, limit: 100 });

  const params = { search, status, category, author_id: authorId, page, limit: 10 };
  const articlesQuery = useArticlesQuery(params);
  const statsQuery = useArticleStatsQuery();

  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const setPublished = useSetArticlePublished();
  const deleteArticle = useDeleteArticle();

  const stats = statsQuery.data;
  const pageData = articlesQuery.data;

  function openCreate() {
    setEditingArticle(null);
    setModalOpen(true);
  }

  function openEdit(article: Article) {
    setEditingArticle(article);
    setModalOpen(true);
  }

  function handleSubmit(input: ArticleInput) {
    if (editingArticle) {
      updateArticle.mutate({ id: editingArticle.id, input }, { onSuccess: () => setModalOpen(false) });
    } else {
      createArticle.mutate({ ...input, author_id: currentUserId ?? "" }, { onSuccess: () => setModalOpen(false) });
    }
  }

  function handleDelete(article: Article) {
    if (confirm(`Hapus artikel "${article.title}"? Tindakan ini tidak bisa dibatalkan.`)) {
      deleteArticle.mutate(article.id);
    }
  }

  const columns: DataTableColumn<Article>[] = [
    {
      key: "thumbnail",
      header: "Thumbnail",
      render: (a) =>
        a.thumbnail_url ? (
          <img src={a.thumbnail_url} alt="" className="h-10 w-14 rounded-lg object-cover" />
        ) : (
          <div className={`h-10 w-14 rounded-lg bg-gradient-to-br ${gradientFor(a.id)}`} />
        ),
    },
    { key: "title", header: "Judul Artikel", render: (a) => <span className="font-medium text-gray-900">{a.title}</span> },
    {
      key: "category",
      header: "Kategori",
      render: (a) => <StatusBadge label={categoryLabel[a.category] ?? a.category.toUpperCase()} tone={categoryTone[a.category] ?? "gray"} dot={false} />,
    },
    {
      key: "author",
      header: "Penulis",
      render: (a) => (
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            {(a.author?.full_name ?? "?").slice(0, 2).toUpperCase()}
          </span>
          <span className="text-gray-700">{a.author?.full_name ?? "-"}</span>
        </div>
      ),
    },
    { key: "date", header: "Tanggal", render: (a) => <span className="text-gray-500">{new Date(a.created_at).toLocaleDateString("id-ID")}</span> },
    { key: "views", header: "Dilihat", render: (a) => <span className="text-gray-600">{a.views_count.toLocaleString("id-ID")}</span> },
    {
      key: "status",
      header: "Status",
      render: (a) => <StatusBadge label={a.status === "published" ? "Dipublikasikan" : "Draft"} tone={a.status === "published" ? "green" : "gray"} />,
    },
    {
      key: "action",
      header: "Aksi",
      render: (a) => (
        <ActionMenu
          items={[
            { label: "Edit", onClick: () => openEdit(a) },
            {
              label: a.status === "published" ? "Jadikan Draft" : "Publikasikan",
              onClick: () => setPublished.mutate({ id: a.id, published: a.status !== "published" }),
            },
            { label: "Hapus", onClick: () => handleDelete(a), tone: "danger" },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Artikel</h1>
          <p className="mt-1 text-sm text-gray-500">
            Buat dan kelola artikel edukasi untuk masyarakat Bali Resik.
          </p>
        </div>
        <Button onClick={openCreate}>
          <PenLine className="h-4 w-4" />
          Tulis Artikel Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Newspaper} iconClassName="bg-brand-50 text-brand-700" label="Total Artikel" value={stats?.total ?? "-"} />
        <StatCard icon={Globe2} iconClassName="bg-blue-50 text-blue-600" label="Dipublikasikan" value={stats?.published ?? "-"} />
        <StatCard icon={FileEdit} iconClassName="bg-amber-50 text-amber-600" label="Draft Artikel" value={stats?.draft ?? "-"} />
        <StatCard icon={Eye} iconClassName="bg-brand-50 text-brand-700" label="Total Pembaca" value={stats?.total_readers ?? "-"} />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-40">
          <option value="">Status: Semua</option>
          <option value="published">Dipublikasikan</option>
          <option value="draft">Draft</option>
        </Select>
        <Select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="w-40">
          <option value="">Kategori: Semua</option>
          <option value="edukasi">Edukasi</option>
          <option value="lifestyle">Lifestyle</option>
          <option value="regulasi">Regulasi</option>
        </Select>
        <Select value={authorId} onChange={(e) => { setAuthorId(e.target.value); setPage(1); }} className="w-40">
          <option value="">Penulis: Semua</option>
          {admins?.items.map((u) => (
            <option key={u.id} value={u.id}>{u.full_name}</option>
          ))}
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={pageData?.items ?? []}
        rowKey={(a) => a.id}
        page={page}
        pageSize={10}
        totalItems={pageData?.total_items ?? 0}
        onPageChange={setPage}
        isLoading={articlesQuery.isLoading}
        emptyMessage="Belum ada artikel yang cocok dengan filter ini."
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

      <ArticleFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createArticle.isPending || updateArticle.isPending}
        initialArticle={editingArticle}
        errorMessage={createArticle.isError || updateArticle.isError ? "Gagal menyimpan artikel. Periksa kembali data yang dimasukkan." : null}
      />
    </div>
  );
}
