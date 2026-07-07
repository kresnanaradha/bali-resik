import type { District } from "@/types/district";

export type UserRole = "warga" | "mitra" | "admin";
export type UserStatus = "active" | "inactive" | "suspended";

// Shape used by the auth store for the logged-in admin (camelCase, built
// from the Firebase user object in AuthProvider).
export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  status: UserStatus;
}

// Shape returned by the backend /users endpoints (snake_case, matches
// backend/internal/domain/user.go's JSON tags).
export interface User {
  id: string;
  firebase_uid: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  district_id: string | null;
  district?: District | null;
  avatar_url: string;
  status: UserStatus;
  joined_at: string;
}
