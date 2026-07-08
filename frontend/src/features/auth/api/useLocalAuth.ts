import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { setToken } from "@/lib/tokenStorage";
import { useAuthStore } from "@/stores/authStore";
import type { Envelope } from "@/types/api";
import type { User as BackendUser } from "@/types/user";

interface AuthResponse {
  user: BackendUser;
  token: string;
}

function applySession(res: AuthResponse, persistent: boolean) {
  setToken(res.token, persistent);
  useAuthStore.getState().setUser({
    id: res.user.id,
    fullName: res.user.full_name,
    email: res.user.email,
    phone: res.user.phone,
    role: res.user.role,
    avatarUrl: res.user.avatar_url || undefined,
    status: res.user.status,
  });
}

export function useLocalLogin() {
  return useMutation({
    mutationFn: async (input: { email: string; password: string; rememberMe: boolean }) => {
      const { data } = await apiClient.post<Envelope<AuthResponse>>("/auth/login", {
        email: input.email,
        password: input.password,
      });
      return { ...data.data, persistent: input.rememberMe };
    },
    onSuccess: (res) => applySession(res, res.persistent),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (input: { full_name: string; email: string; password: string }) => {
      const { data } = await apiClient.post<Envelope<AuthResponse>>("/auth/register", input);
      return data.data;
    },
    onSuccess: (res) => applySession(res, true),
  });
}
