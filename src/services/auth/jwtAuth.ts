// src/services/auth/jwtAuth.ts
import { loginUser, registerUser, setAuth, clearAuth } from "@/lib/api";

export async function loginWithEmail(params: { email: string; password: string }) {
  const auth = await loginUser(params);
  setAuth(auth);
  return auth;
}

export async function registerWithEmail(params: { name: string; email: string; password: string }) {
  const auth = await registerUser(params);
  setAuth(auth);
  return auth;
}

export function logoutJwtOnly() {
  clearAuth();
}
