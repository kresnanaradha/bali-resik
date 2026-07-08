import type { User } from "@/types/user";

export type ArticleStatus = "draft" | "published";

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  thumbnail_url: string;
  author_id: string;
  author?: User | null;
  status: ArticleStatus;
  views_count: number;
  chatbot_indexed: boolean;
  published_at: string | null;
  created_at: string;
}
