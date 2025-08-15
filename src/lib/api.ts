// src/lib/api.ts
// Simple API client utilities for the frontend

function detectDefaultBase(): string {
  try {
    if (typeof window !== "undefined") {
      const isLocal = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
      if (isLocal) {
        // Prefer 5001 for local backend if not overridden via env
        return `${window.location.protocol}//${window.location.hostname}:5001/api/v1`;
      }
    }
  } catch {}
  return "http://localhost:5000/api/v1";
}

const DEFAULT_API_BASE = detectDefaultBase();

const rawBase =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) ||
  DEFAULT_API_BASE;

// Normalize: remove trailing slashes
export const API_BASE_URL = rawBase.replace(/\/+$/, "");

function joinUrl(base: string, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const url = joinUrl(API_BASE_URL, path);
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      body?.message || body?.error || `Request failed (${res.status}) for ${url}`;
    throw new Error(message);
  }
  return body as ApiResponse<T>;
}

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  isVerified?: boolean;
};

export type AuthPayload = {
  user: AuthUser;
  token: string;
};

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthPayload> {
  const res = await apiFetch<AuthPayload>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.success || !res.data) throw new Error(res.message || "Registration failed");
  return res.data;
}

export async function loginUser(input: { email: string; password: string }): Promise<AuthPayload> {
  const res = await apiFetch<AuthPayload>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.success || !res.data) throw new Error(res.message || "Login failed");
  return res.data;
}

export function setAuth(auth: AuthPayload) {
  localStorage.setItem("auth_token", auth.token);
  localStorage.setItem("auth_user", JSON.stringify(auth.user));
}

export function clearAuth() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
}
