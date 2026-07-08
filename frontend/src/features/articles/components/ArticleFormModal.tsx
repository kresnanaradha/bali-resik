import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { ArticleInput } from "@/features/articles/api/useArticles";
import type { Article } from "@/types/article";

interface ArticleFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: ArticleInput) => void;
  isSubmitting?: boolean;
  initialArticle?: Article | null;
  errorMessage?: string | null;
}

const emptyForm: ArticleInput = {
  title: "",
  category: "edukasi",
  excerpt: "",
  content: "",
  thumbnail_url: "",
  author_id: "",
  chatbot_indexed: true,
};

export function ArticleFormModal({ open, onClose, onSubmit, isSubmitting, initialArticle, errorMessage }: ArticleFormModalProps) {
  const [form, setForm] = useState<ArticleInput>(emptyForm);

  useEffect(() => {
    if (initialArticle) {
      setForm({
        title: initialArticle.title,
        category: initialArticle.category,
        excerpt: initialArticle.excerpt,
        content: initialArticle.content,
        thumbnail_url: initialArticle.thumbnail_url,
        author_id: initialArticle.author_id,
        chatbot_indexed: initialArticle.chatbot_indexed,
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialArticle, open]);

  const canSubmit = form.title.trim().length > 0 && form.content.trim().length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialArticle ? "Edit Artikel" : "Tulis Artikel Baru"}
      description={initialArticle ? "Perbarui artikel ini." : "Artikel baru dimulai sebagai draft."}
      maxWidthClassName="max-w-2xl"
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
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Judul Artikel</label>
          <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Judul artikel" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">Kategori</label>
            <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              <option value="edukasi">Edukasi</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="regulasi">Regulasi</option>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">Thumbnail URL</label>
            <Input value={form.thumbnail_url} onChange={(e) => setForm((f) => ({ ...f, thumbnail_url: e.target.value }))} placeholder="https://..." />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Ringkasan</label>
          <textarea
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            placeholder="Ringkasan singkat artikel"
            rows={2}
            className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Konten</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            placeholder="Isi artikel (HTML/markdown)"
            rows={8}
            className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={form.chatbot_indexed}
            onChange={(e) => setForm((f) => ({ ...f, chatbot_indexed: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          Tampilkan di menu Edukasi & chatbot
        </label>
      </div>
    </Modal>
  );
}
