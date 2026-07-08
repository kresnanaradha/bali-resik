import { useEffect, type ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiClient } from "@/lib/apiClient";
import { getToken, clearToken } from "@/lib/tokenStorage";
import { useAuthStore } from "@/stores/authStore";
import { syncBackendUser } from "@/features/auth/api/syncBackendUser";
import type { Envelope } from "@/types/api";
import type { User as BackendUser } from "@/types/user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    // A local session (from /auth/login or /auth/register) takes priority —
    // validate it against the backend and skip the Firebase listener
    // entirely, since letting both run would let Firebase's "signed out"
    // state (onAuthStateChanged fires with null) wipe out a valid local
    // session that has nothing to do with Firebase.
    const localToken = getToken();
    if (localToken) {
      apiClient
        .get<Envelope<BackendUser>>("/auth/me")
        .then(({ data }) => {
          const u = data.data;
          setUser({
            id: u.id,
            fullName: u.full_name,
            email: u.email,
            phone: u.phone,
            role: u.role,
            avatarUrl: u.avatar_url || undefined,
            status: u.status,
          });
        })
        .catch(() => {
          clearToken();
          setUser(null);
        })
        .finally(() => setLoading(false));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          fullName: firebaseUser.displayName ?? firebaseUser.email ?? "Admin",
          email: firebaseUser.email ?? "",
          avatarUrl: firebaseUser.photoURL ?? undefined,
          role: "admin",
          status: "active",
        });
        void syncBackendUser();
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [setUser, setLoading]);

  return children;
}
