// =====================================================================
// api.ts — koneksi ke backend Klinik Kulit (REST + JWT, token di localStorage)
// =====================================================================

import { mockRequest } from "./mockApi";

const ENV = (import.meta as unknown as { env: { VITE_API_BASE?: string; VITE_DEMO?: string } }).env;
// DEMO aktif jika VITE_DEMO=1 ATAU tidak ada VITE_API_BASE (deploy frontend-only tanpa backend).
export const DEMO = ENV.VITE_DEMO === "1" || !ENV.VITE_API_BASE;
const API_BASE = ENV.VITE_API_BASE || "http://localhost:3002/api";
const TOKEN_KEY = "klinik_token";
const USER_KEY = "klinik_user";

export type AuthUser = { id: number; username: string; nama: string; role: string };

export function saveAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function getUser(): AuthUser | null {
  const s = localStorage.getItem(USER_KEY);
  return s ? (JSON.parse(s) as AuthUser) : null;
}
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  if (DEMO) return mockRequest<T>(path, options);
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `HTTP ${res.status}`);
  return data as T;
}

export async function login(username: string, password: string): Promise<AuthUser> {
  if (DEMO) {
    const { token, user } = await mockRequest<{ token: string; user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    saveAuth(token, user);
    return user;
  }
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || "Login gagal");
  const { token, user } = data as { token: string; user: AuthUser };
  saveAuth(token, user);
  return user;
}
