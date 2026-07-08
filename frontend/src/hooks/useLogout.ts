import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { clearToken } from "@/lib/tokenStorage";
import { useAuthStore } from "@/stores/authStore";

// Shared by Sidebar and Topbar so both "Keluar" entry points do the exact
// same thing: clear the local session token, reset the store, sign out of
// Firebase (harmless no-op if that path was never used), then redirect.
export function useLogout() {
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  return async function logout() {
    clearToken();
    setUser(null);
    await signOut(auth).catch(() => {});
    navigate("/login", { replace: true });
  };
}
