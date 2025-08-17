// src/services/auth/oauthAuth.ts
import { API_BASE_URL } from "@/lib/api";

export function startGoogleOAuth(next?: string) {
  const url = new URL(`${API_BASE_URL}/auth/google`);
  if (next) url.searchParams.set("next", next);
  window.location.href = url.toString();
}
