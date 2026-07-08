// Backs "Ingat Saya" on the login form: checked -> localStorage (persists
// across browser restarts), unchecked -> sessionStorage (cleared when the
// tab closes). Read checks both so either path works transparently.
const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, persistent: boolean) {
  clearToken();
  (persistent ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}
