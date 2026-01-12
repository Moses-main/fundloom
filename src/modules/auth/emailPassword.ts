// src/modules/auth/emailPassword.ts
import { loginUser, registerUser, setAuth, clearAuth, apiFetch } from "@/lib/api";

export async function checkEmailExists(email: string): Promise<boolean> {
  const res = await apiFetch<{ exists: boolean }>("/auth/check-email?" + new URLSearchParams({ email }).toString());
  if (!res.success || !res.data) throw new Error(res.message || "Failed to check email");
  return !!res.data.exists;
}

export type SignupInput = { name: string; email: string; password: string; confirmPassword: string };

export async function signup(input: SignupInput): Promise<{ next: string; email: string } | never> {
  if (!input.password || input.password !== input.confirmPassword) {
    throw new Error("Passwords do not match");
  }
  const exists = await checkEmailExists(input.email);
  if (exists) {
    return { next: `/auth?mode=login&email=${encodeURIComponent(input.email)}`, email: input.email };
  }
  // Create account (backend will provision Privy wallet best-effort)
  const { name, email, password } = input;
  await registerUser({ name, email, password });
  // Do NOT auto-login; send user to login screen with prefilled email
  return { next: `/auth?mode=login&email=${encodeURIComponent(email)}`, email };
}

export async function login(input: { email: string; password: string }): Promise<{ next: string }> {
  const auth = await loginUser(input);
  setAuth(auth);
  return { next: "/dashboard?tab=overview" };
}

export function logout(): { next: string } {
  clearAuth();
  return { next: "/" };
}
