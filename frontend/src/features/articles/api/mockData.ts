// Data statis sementara — lihat catatan di features/dashboard/api/mockData.ts

export const articleStats = {
  total: { value: 124, trend: 12 },
  published: { value: 86 },
  draft: { value: 38 },
  totalReaders: { value: 12482, shortLabel: "24.5k" },
};

export interface Article {
  id: string;
  title: string;
  category: "edukasi" | "lifestyle" | "regulasi";
  authorName: string;
  authorInitials: string;
  date: string;
  views: string;
  thumbnailGradient: string;
}

export const articles: Article[] = [
  {
    id: "1",
    title: "Artikel 1",
    category: "edukasi",
    authorName: "I Made W.",
    authorInitials: "IM",
    date: "12 Mei 2026",
    views: "1.2k",
    thumbnailGradient: "from-brand-700 to-brand-400",
  },
  {
    id: "2",
    title: "Artikel 2",
    category: "lifestyle",
    authorName: "Ni Luh P.",
    authorInitials: "NL",
    date: "10 Mei 2026",
    views: "850",
    thumbnailGradient: "from-amber-500 to-orange-300",
  },
  {
    id: "3",
    title: "Artikel 3",
    category: "regulasi",
    authorName: "Dinas LHK",
    authorInitials: "DS",
    date: "08 Mei 2026",
    views: "4.5k",
    thumbnailGradient: "from-emerald-800 to-teal-500",
  },
];
