import axios from "axios";
import { auth } from "@/lib/firebase";
import { getToken } from "@/lib/tokenStorage";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

apiClient.interceptors.request.use(async (config) => {
  // The app's own login (/auth/login, /auth/register) takes priority when
  // present — it's real credential-backed auth. Firebase's ID token is only
  // used as a fallback for the AUTH_MODE=firebase path.
  const localToken = getToken();
  if (localToken) {
    config.headers.Authorization = `Bearer ${localToken}`;
    return config;
  }
  const token = await auth.currentUser?.getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
