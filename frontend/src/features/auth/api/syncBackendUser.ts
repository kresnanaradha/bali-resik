import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/stores/authStore";
import type { Envelope } from "@/types/api";
import type { User as BackendUser } from "@/types/user";

// The Firebase-derived profile set at login time doesn't carry the backend's
// UUID id (needed for e.g. notifications keyed by user_id). Call this after
// login (real or dev-bypass) to overwrite the store with the actual backend
// user. Fails silently if the backend is unreachable, leaving the
// Firebase-derived profile in place so the UI still works without it.
export async function syncBackendUser() {
  try {
    const { data } = await apiClient.get<Envelope<BackendUser>>("/auth/me");
    const backendUser = data.data;
    if (!backendUser) return;
    useAuthStore.getState().setUser({
      id: backendUser.id,
      fullName: backendUser.full_name,
      email: backendUser.email,
      phone: backendUser.phone,
      role: backendUser.role,
      avatarUrl: backendUser.avatar_url || undefined,
      status: backendUser.status,
    });
  } catch {
    // Backend unreachable — keep the Firebase-derived profile already set.
  }
}
