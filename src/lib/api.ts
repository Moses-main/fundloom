// src/lib/api.ts
// Simple API client utilities for the frontend
import { loadingBus } from "@/lib/loadingBus";

function detectDefaultBase(): string {
  try {
    if (typeof window !== "undefined") {
      const isLocal = /^(localhost|127\.0\.0\.1)$/i.test(
        window.location.hostname
      );
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
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_API_BASE_URL) ||
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

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  loadingBus.begin("api");
  try {
    const url = joinUrl(API_BASE_URL, path);
    const isAuthPath = /^\/?auth\//i.test(path.replace(/^\/+/, ""));
    // Build headers carefully so defaults are not overridden by a later spread of init
    const defaultHeaders = new Headers({ "Content-Type": "application/json" });
    let hadToken = false;
    if (init?.headers) {
      const provided = new Headers(init.headers as HeadersInit);
      provided.forEach((value, key) => defaultHeaders.set(key, value));
    }
    // If Authorization was not provided, auto-attach JWT from localStorage when available
    try {
      const hasAuthHeader = defaultHeaders.has("Authorization");
      if (!hasAuthHeader) {
        const token = localStorage.getItem("auth_token");
        if (token) {
          defaultHeaders.set("Authorization", `Bearer ${token}`);
          hadToken = true;
        }
      } else {
        hadToken = true;
      }
    } catch {}
    const { headers: _ignored, ...rest } = init || {};
    const res = await fetch(url, {
      ...rest,
      headers: defaultHeaders,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) {
        // Do not redirect for auth endpoints; surface the error to the form instead
        if (!isAuthPath && hadToken) {
          try {
            clearAuth();
          } catch {}
          try {
            if (typeof window !== "undefined") {
              const currentPath = window.location.pathname;
              // Avoid redirect loop or showing banner while user is already on auth page
              if (!/^\/?auth(\/|$)/i.test(currentPath.replace(/^\/+/, ""))) {
                const current = currentPath + window.location.search;
                const redirect = `/auth?reason=expired&next=${encodeURIComponent(current)}`;
                window.location.replace(redirect);
              }
            }
          } catch {}
        }
        // For login/register/forgot or when no token existed, throw the error without redirect
      }
      // Prefer specific validation error details when available
      const firstValidationError = Array.isArray(body?.errors) && body.errors.length > 0
        ? body.errors[0]?.message || body.errors[0]?.field
        : undefined;
      const message =
        firstValidationError ||
        body?.message ||
        body?.error ||
        `Request failed (${res.status}) for ${url}`;
      throw new Error(message);
    }
    return body as ApiResponse<T>;
  } finally {
    loadingBus.end("api");
  }
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
  if (!res.success || !res.data)
    throw new Error(res.message || "Registration failed");
  return res.data;
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<AuthPayload> {
  const res = await apiFetch<AuthPayload>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.success || !res.data) throw new Error(res.message || "Login failed");
  return res.data;
}

// Forgot password — backend sends reset token (dev) or email (prod)
export async function forgotPassword(input: { email: string }) {
  const res = await apiFetch<{ resetToken?: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.success) throw new Error(res.message || "Failed to send reset link");
  return res.data;
}

export function setAuth(auth: AuthPayload) {
  localStorage.setItem("auth_token", auth.token);
  localStorage.setItem("auth_user", JSON.stringify(auth.user));
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth_changed"));
    }
  } catch {}
}

export function clearAuth() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth_changed"));
    }
  } catch {}
}

// ---------- Backend data types (subset) ----------
export type BackendDonation = {
  _id: string;
  amount: number;
  message?: string;
  isAnonymous?: boolean;
  donorName?: string;
  donor?: { name?: string } | null;
  createdAt: string;
};

export type BackendComment = {
  id: string;
  authorName?: string;
  message: string;
  createdAt: string;
};

// ---------- Helpers used by AppContext ----------
export async function getCampaignDetails(id: string) {
  return apiFetch<{
    campaign: any;
    stats?: any;
    recentDonations?: BackendDonation[];
  }>(`/campaigns/${id}`);
}

// List campaigns with optional filters/pagination
export async function getCampaigns(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  status?: "active" | "completed" | "all";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.category) q.set("category", params.category);
  if (params?.search) q.set("search", params.search);
  if (params?.status) q.set("status", params.status);
  if (params?.sortBy) q.set("sortBy", params.sortBy);
  if (params?.sortOrder) q.set("sortOrder", params.sortOrder);
  const qs = q.toString();
  const path = qs ? `/campaigns?${qs}` : "/campaigns";
  return apiFetch<{ campaigns: any[]; pagination: any }>(path);
}

// List campaigns created by a specific user
export async function getCampaignsByUser(
  userId: string,
  params?: {
    page?: number;
    limit?: number;
    status?: "active" | "completed" | "all";
  }
) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.status && params.status !== "all") q.set("status", params.status);
  const qs = q.toString();
  const path = qs
    ? `/campaigns/user/${encodeURIComponent(userId)}?${qs}`
    : `/campaigns/user/${encodeURIComponent(userId)}`;
  return apiFetch<{ campaigns: any[]; pagination: any }>(path);
}

export async function getCampaignComments(
  campaignId: string,
  page = 1,
  limit = 20
) {
  const q = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();
  return apiFetch<{ comments: BackendComment[] }>(
    `/comments/campaign/${campaignId}?${q}`
  );
}

// Donations for a specific campaign (public, completed only)
export async function getCampaignDonations(
  campaignId: string,
  page = 1,
  limit = 20
) {
  const q = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();
  return apiFetch<{ donations: BackendDonation[]; pagination: any }>(
    `/donations/campaign/${encodeURIComponent(campaignId)}?${q}`
  );
}

export async function postGuestDonation(input: {
  campaignId: string;
  amount: number;
  paymentMethod: "crypto" | "card" | "bank" | "mobile";
  message?: string;
  isAnonymous?: boolean;
  donorName?: string;
  donorEmail?: string;
}) {
  return apiFetch<{ donation: any }>(`/donations/guest`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// List donations made by the authenticated user
export async function getMyDonations(params?: { page?: number; limit?: number; status?: string }) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.status) q.set("status", params.status);
  const qs = q.toString();
  const path = qs ? `/donations/my-donations?${qs}` : "/donations/my-donations";
  return apiFetch<{ donations: any[]; pagination: any }>(path, { method: "GET" });
}

// ---------- Authenticated donation (requires Bearer token) ----------
export async function postAuthDonation(
  input: {
    campaignId: string;
    amount: number;
    paymentMethod: "crypto" | "card" | "bank" | "mobile";
    message?: string;
    isAnonymous?: boolean;
  },
  token: string
) {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  return apiFetch<{ donation: any }>(`/donations`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });
}

// ---------- Create Campaign (backend) ----------
export type CreateCampaignInput = {
  title: string;
  description: string;
  category: string;
  targetAmount: number;
  deadline: string; // ISO date string
  image?: string | null;
  template?: "default" | "impact" | "medical" | "creative";
  charityAddress?: string;
};

export async function createCampaign(
  input: CreateCampaignInput,
  token?: string
) {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return apiFetch<{ campaign: any }>(`/campaigns`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });
}

// ---------- Update Campaign (backend) ----------
export async function updateCampaign(
  id: string,
  input: Partial<CreateCampaignInput>,
  token: string
) {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  return apiFetch<{ campaign: any }>(`/campaigns/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(input),
  });
}

// ---------- Withdraw Campaign Funds (creator only) ----------
export async function postCampaignWithdraw(id: string) {
  return apiFetch<{ campaign: any }>(`/campaigns/${encodeURIComponent(id)}/withdraw`, {
    method: "POST",
  });
}

// ---------- Upload Image (Cloudinary via backend) ----------
export async function uploadImage(
  payload: { file?: string; url?: string; folder?: string },
  token?: string
) {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return apiFetch<{ publicId: string; url: string }>(`/uploads/image`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

// ---------- Payments: Paystack Card Initialize ----------
export async function initPaystackCard(input: {
  campaignId: string;
  amount: number; // Naira
  email: string;
  donorName?: string;
  isAnonymous?: boolean;
  message?: string;
  callbackUrl?: string;
}) {
  return apiFetch<{ authorizationUrl: string; reference: string; donationId: string }>(
    `/payments/paystack/initialize`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}



export type CampaignUpdateItem = {
  _id?: string;
  id?: string;
  title?: string;
  content?: string;
  message?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: { _id?: string; name?: string } | null;
  authorName?: string;
  moderationStatus?: string;
};

export async function getCampaignUpdates(
  campaignId: string,
  page = 1,
  limit = 20
) {
  const q = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  }).toString();
  return apiFetch<{ updates: CampaignUpdateItem[]; pagination?: any }>(
    `/campaigns/${encodeURIComponent(campaignId)}/updates?${q}`
  );
}

export async function createCampaignUpdate(
  campaignId: string,
  input: { title: string; content: string },
  token: string
) {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  return apiFetch<{ update: CampaignUpdateItem }>(
    `/campaigns/${encodeURIComponent(campaignId)}/updates`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(input),
    }
  );
}

export async function patchCampaignLifecycle(
  campaignId: string,
  input: {
    isActive?: boolean;
    isArchived?: boolean;
    moderationReason?: string;
    lifecycleStatus?: string;
  },
  token: string
) {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  return apiFetch<{ campaign: any }>(`/campaigns/${encodeURIComponent(campaignId)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(input),
  });
}

// ---------- Comments ----------
export async function createComment(
  campaignId: string,
  input: { message: string; isAnonymous?: boolean; parentCommentId?: string },
  token: string
) {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  return apiFetch<{ comment: any }>(`/comments/campaign/${campaignId}`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });
}



export async function reportCampaignComment(
  campaignId: string,
  commentId: string,
  input: { reason: string; details?: string },
  token: string
) {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  return apiFetch<{ report: any }>(
    `/comments/campaign/${encodeURIComponent(campaignId)}/${encodeURIComponent(commentId)}/report`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(input),
    }
  );
}

export async function reportCampaign(campaignId: string, input: { reason: string; details?: string }, token: string) {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  return apiFetch<{ report: any }>(`/campaigns/${encodeURIComponent(campaignId)}/report`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });
}

// ---------- User / Account helpers ----------
export async function getMe() {
  return apiFetch<{ user: any }>(`/auth/me`, { method: "GET" });
}

export async function refreshSession() {
  return apiFetch<AuthPayload>(`/auth/refresh`, { method: "POST" });
}

export async function logAuthEvent(input: {
  event: string;
  provider?: string;
  success: boolean;
  message?: string;
  metadata?: Record<string, unknown>;
}) {
  return apiFetch<{ logged?: boolean }>(`/auth/audit`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getUserDashboard() {
  return apiFetch<{
    campaigns: any[];
    recentDonationsReceived: any[];
    recentDonationsMade: any[];
    stats: { campaigns: any; donations: { totalDonations: number; totalDonated: number } };
  }>(`/users/dashboard`, { method: "GET" });
}

export async function changePassword(input: { currentPassword: string; newPassword: string }) {
  return apiFetch<{}>(`/auth/change-password`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteAccount() {
  return apiFetch<{}>(`/users/account`, { method: "DELETE" });
}

export function connectWallet(input: { chain: "evm"; address: string }) {
  return apiFetch<{ success: boolean }>("/auth/wallet/connect", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function disconnectWallet(input: { chain: "evm" }) {
  return apiFetch<{ success: boolean }>("/auth/wallet/disconnect", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function disconnectGoogle() {
  return apiFetch<{ user: any }>(`/auth/disconnect-google`, {
    method: "POST",
  });
}

// ---------- Wallet Auth (EVM) ----------
// These endpoints may not exist on the backend yet. We call them optimistically and surface errors.
export async function requestWalletNonce(address: string) {
  return apiFetch<{ nonce: string }>(`/auth/wallet/nonce`, {
    method: "POST",
    body: JSON.stringify({ address }),
  });
}

export async function verifyWalletSignature(payload: {
  address: string;
  message: string;
  signature: string;
}) {
  return apiFetch<AuthPayload>(`/auth/wallet/verify`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---------- Optional: record crypto donation on backend (fire-and-forget if backend supports it) ----------
export async function recordCryptoDonation(input: {
  campaignId: string;
  txHash: string;
  amountWei: string;
  chainId: string;
  from: string;
  message?: string;
}) {
  return apiFetch<{ donation?: any }>(`/donations/crypto`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export type CryptoDonationLifecycleState =
  | "initiated"
  | "wallet_prompt"
  | "pending"
  | "confirmed"
  | "failed";

type UpsertCryptoDonationTxInput = {
  campaignId: string;
  chainId: string;
  state: CryptoDonationLifecycleState;
  txHash?: string;
  amountWei?: string;
  from?: string;
  message?: string;
  idempotencyKey?: string;
  errorMessage?: string;
};

/**
 * Best-effort lifecycle persistence for crypto donations.
 * Backends may implement either `/donations/crypto/tx` or `/donations/crypto` upsert semantics.
 */
export async function upsertCryptoDonationTx(input: UpsertCryptoDonationTxInput) {
  try {
    return await apiFetch<{ donation?: any }>(`/donations/crypto/tx`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  } catch {
    return apiFetch<{ donation?: any }>(`/donations/crypto`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }
}

// ---------- Admin (Basic Auth) ----------
export type BasicAuth = { basicToken: string }; // base64 of username:password

function withBasic(init: RequestInit | undefined, basicToken: string): RequestInit {
  const headers = new Headers((init?.headers as HeadersInit) || {});
  headers.set("Authorization", `Basic ${basicToken}`);
  return { ...(init || {}), headers };
}

export async function adminListCampaigns(params: { page?: number; limit?: number }, auth: BasicAuth) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const path = `/admin/campaigns${q.toString() ? `?${q.toString()}` : ""}`;
  return apiFetch<{ campaigns: any[]; pagination: any }>(path, withBasic(undefined, auth.basicToken));
}

export async function adminApproveCampaign(id: string, auth: BasicAuth) {
  return apiFetch<{ campaign: any }>(`/admin/campaigns/${id}/approve`, withBasic({ method: "PUT" }, auth.basicToken));
}
export async function adminActivateCampaign(id: string, auth: BasicAuth) {
  return apiFetch<{ campaign: any }>(`/admin/campaigns/${id}/activate`, withBasic({ method: "PUT" }, auth.basicToken));
}
export async function adminDeactivateCampaign(id: string, auth: BasicAuth) {
  return apiFetch<{ campaign: any }>(`/admin/campaigns/${id}/deactivate`, withBasic({ method: "PUT" }, auth.basicToken));
}

export async function adminListUsers(params: { page?: number; limit?: number; search?: string }, auth: BasicAuth) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.search) q.set("search", params.search);
  const path = `/admin/users${q.toString() ? `?${q.toString()}` : ""}`;
  return apiFetch<{ users: any[]; pagination: any }>(path, withBasic(undefined, auth.basicToken));
}
export async function adminLockUser(id: string, auth: BasicAuth) {
  return apiFetch<{ user: any }>(`/admin/users/${id}/lock`, withBasic({ method: "PUT" }, auth.basicToken));
}
export async function adminUnlockUser(id: string, auth: BasicAuth) {
  return apiFetch<{ user: any }>(`/admin/users/${id}/unlock`, withBasic({ method: "PUT" }, auth.basicToken));
}
export async function adminDeleteUser(id: string, auth: BasicAuth) {
  return apiFetch<{}>(`/admin/users/${id}`, withBasic({ method: "DELETE" }, auth.basicToken));
}


export async function adminListReports(
  params: { page?: number; limit?: number; status?: string },
  auth: BasicAuth
) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.status) q.set("status", params.status);
  const path = `/admin/reports${q.toString() ? `?${q.toString()}` : ""}`;
  return apiFetch<{ reports: any[]; pagination?: any }>(
    path,
    withBasic(undefined, auth.basicToken)
  );
}

export async function adminResolveReport(
  reportId: string,
  input: { status: "resolved" | "rejected"; resolutionNote?: string },
  auth: BasicAuth
) {
  return apiFetch<{ report: any }>(
    `/admin/reports/${encodeURIComponent(reportId)}`,
    withBasic(
      {
        method: "PUT",
        body: JSON.stringify(input),
      },
      auth.basicToken
    )
  );
}
