// Mirrors backend/pkg/response/response.go
export interface Envelope<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}
