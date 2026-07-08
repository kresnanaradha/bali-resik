import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { Envelope, Page } from "@/types/api";
import type { Article } from "@/types/article";

export interface ArticleListParams {
  search?: string;
  status?: string;
  category?: string;
  author_id?: string;
  page: number;
  limit: number;
}

export interface ArticleStats {
  total: number;
  published: number;
  draft: number;
  total_readers: number;
}

function useInvalidateArticles() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["articles"] });
  };
}

export function useArticlesQuery(params: ArticleListParams) {
  return useQuery({
    queryKey: ["articles", "list", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Envelope<Page<Article>>>("/articles", { params });
      return data.data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useArticleStatsQuery() {
  return useQuery({
    queryKey: ["articles", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<Envelope<ArticleStats>>("/articles/stats");
      return data.data;
    },
  });
}

export interface ArticleInput {
  title: string;
  category: string;
  excerpt: string;
  content: string;
  thumbnail_url: string;
  author_id: string;
  chatbot_indexed: boolean;
}

export function useCreateArticle() {
  const invalidate = useInvalidateArticles();
  return useMutation({
    mutationFn: async (input: ArticleInput) => {
      const { data } = await apiClient.post<Envelope<Article>>("/articles", input);
      return data.data;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateArticle() {
  const invalidate = useInvalidateArticles();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ArticleInput }) => {
      const { data } = await apiClient.patch<Envelope<Article>>(`/articles/${id}`, input);
      return data.data;
    },
    onSuccess: invalidate,
  });
}

export function useSetArticlePublished() {
  const invalidate = useInvalidateArticles();
  return useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { data } = await apiClient.patch<Envelope<Article>>(`/articles/${id}/publish`, { published });
      return data.data;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteArticle() {
  const invalidate = useInvalidateArticles();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/articles/${id}`);
    },
    onSuccess: invalidate,
  });
}
