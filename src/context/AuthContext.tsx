// src/context/AuthContext.tsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import {
  clearAuth as clearAuthStorage,
  getMe,
  logAuthEvent,
  refreshSession,
  verifyWalletSignature,
  verifyPrivyAuth,
  type AuthPayload,
} from "@/lib/api";
import {
  loginWithPrivyMethod,
  privyLogout,
  type PrivyLoginMethod,
  type PrivyUserLike,
} from "@/lib/privyRuntime";

export type AuthUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  authProvider?: "wallet" | "privy" | "jwt";
  walletAddress?: string | null;
  wallets?: Array<{ provider?: string; chainType?: string; address: string }>;
};

export type LoginWithWalletParams = {
  address: string;
  signature: string;
  message: string;
  walletType: string;
};

export type AuthContextType = {
  isAuthenticated: boolean;
  hasJwt: boolean;
  walletConnected: boolean;
  authMethod: "none" | "jwt" | "wallet" | "both";
  user: AuthUser | null;
  token: string | null;
  logout: () => Promise<void>;
  loginWithWallet: (params: LoginWithWalletParams) => Promise<void>;
  loginWithPrivy: (method: PrivyLoginMethod) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function extractEmail(user: PrivyUserLike): string | undefined {
  if (typeof user.email === "string") return user.email;
  if (user.email && typeof user.email === "object") return user.email.address;
  const emailAccount = user.linkedAccounts?.find((a) => a.email);
  return emailAccount?.email;
}

function extractWalletAddress(user: PrivyUserLike): string | null {
  if (user.wallet?.address) return user.wallet.address;
  if (Array.isArray(user.wallets) && user.wallets[0]?.address) return user.wallets[0].address;
  const linkedWallet = user.linkedAccounts?.find((a) => a.address);
  return linkedWallet?.address || null;
}

function toAuthUserFromPayload(payloadUser: Record<string, unknown>): AuthUser {
  const id = (payloadUser.id as string) || (payloadUser._id as string) || undefined;
  const email = payloadUser.email as string | undefined;
  const name = (payloadUser.name as string) || (email ? email.split("@")[0] : "User");
  const walletAddress =
    (payloadUser.walletAddress as string) ||
    (Array.isArray(payloadUser.wallets)
      ? ((payloadUser.wallets[0] as { address?: string } | undefined)?.address ?? null)
      : null);

  return {
    id,
    name,
    email,
    role: (payloadUser.role as string) || "user",
    authProvider: "jwt",
    walletAddress,
    wallets: Array.isArray(payloadUser.wallets)
      ? (payloadUser.wallets as Array<{ provider?: string; chainType?: string; address: string }>)
      : walletAddress
      ? [{ provider: "wallet", chainType: "evm", address: walletAddress }]
      : [],
  };
}

function persistSession(
  token: string,
  normalizedUser: AuthUser,
  setToken: (t: string | null) => void,
  setUser: (u: AuthUser | null) => void,
  setEvmAddress: (a: string | null) => void
) {
  localStorage.setItem("auth_token", token);
  localStorage.setItem("auth_user", JSON.stringify(normalizedUser));
  setToken(token);
  setUser(normalizedUser);
  setEvmAddress(normalizedUser.walletAddress || null);
  window.dispatchEvent(new Event("auth_changed"));
}

function isInsecureWalletFallbackAllowed(): boolean {
  if ((import.meta as { env?: { PROD?: boolean } }).env?.PROD) return false;
  const flag =
    (typeof import.meta !== "undefined" &&
      (import.meta as { env?: { VITE_ALLOW_INSECURE_WALLET_SESSION?: string } }).env
        ?.VITE_ALLOW_INSECURE_WALLET_SESSION) ||
    "false";
  return flag === "true";
}

function parseJwtExpMs(token: string | null): number | null {
  if (!token || /^wallet:/.test(token)) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
    if (!payload.exp) return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

async function auditAuthEvent(event: {
  event: string;
  provider?: string;
  success: boolean;
  message?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await logAuthEvent(event);
  } catch {
    // best-effort audit sink
  }
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [evmAddress, setEvmAddress] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const t = localStorage.getItem("auth_token");
      const u = localStorage.getItem("auth_user");
      setToken(t);
      if (u) {
        const parsed = JSON.parse(u);
        const normalized = parsed && typeof parsed === "object" ? { ...parsed, id: parsed.id || parsed._id } : parsed;
        setUser(normalized);
      } else {
        setUser(null);
      }
    } catch {
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const syncAuthFromStorage = () => {
      try {
        const t = localStorage.getItem("auth_token");
        const u = localStorage.getItem("auth_user");
        setToken(t);
        if (u) {
          const parsed = JSON.parse(u);
          const normalized = parsed && typeof parsed === "object" ? { ...parsed, id: parsed.id || parsed._id } : parsed;
          setUser(normalized);
        } else {
          setUser(null);
        }
      } catch {
        setToken(null);
        setUser(null);
      }
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === "auth_token" || e.key === "auth_user") syncAuthFromStorage();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("auth_changed", syncAuthFromStorage as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth_changed", syncAuthFromStorage as EventListener);
    };
  }, []);

  // Session hardening: validate server-issued tokens on mount
  useEffect(() => {
    const validateSession = async () => {
      const currentToken = localStorage.getItem("auth_token");
      if (!currentToken) return;
      if (!/^wallet:/.test(currentToken)) {
        try {
          const me = await getMe();
          const payloadUser = (me.data?.user || {}) as Record<string, unknown>;
          if (me?.success && payloadUser && Object.keys(payloadUser).length > 0) {
            const normalized = toAuthUserFromPayload(payloadUser);
            localStorage.setItem("auth_user", JSON.stringify(normalized));
            setUser(normalized);
          } else {
            clearAuthStorage();
            setToken(null);
            setUser(null);
          }
        } catch {
          clearAuthStorage();
          setToken(null);
          setUser(null);
        }
      }
    };

    validateSession();
  }, []);

  // Session hardening: refresh and expiry handling for JWT-like tokens
  useEffect(() => {
    const expMs = parseJwtExpMs(token);
    if (!expMs) return;

    const now = Date.now();
    const refreshAt = expMs - 2 * 60 * 1000;
    const refreshDelay = Math.max(0, refreshAt - now);
    const expiryDelay = Math.max(0, expMs - now);

    const refreshTimer = window.setTimeout(async () => {
      try {
        const refreshed = await refreshSession();
        if (refreshed?.success && refreshed.data?.token && refreshed.data?.user) {
          const normalized = toAuthUserFromPayload(refreshed.data.user as unknown as Record<string, unknown>);
          persistSession(refreshed.data.token, normalized, setToken, setUser, setEvmAddress);
          await auditAuthEvent({ event: "session_refresh", provider: "jwt", success: true });
        }
      } catch {
        await auditAuthEvent({ event: "session_refresh", provider: "jwt", success: false, message: "refresh failed" });
      }
    }, refreshDelay);

    const expiryTimer = window.setTimeout(async () => {
      clearAuthStorage();
      setToken(null);
      setUser(null);
      await auditAuthEvent({ event: "session_expired", provider: "jwt", success: true });
      if (!location.pathname.startsWith("/auth")) {
        navigate(`/auth?reason=expired&next=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
      }
    }, expiryDelay);

    return () => {
      window.clearTimeout(refreshTimer);
      window.clearTimeout(expiryTimer);
    };
  }, [token, location.pathname, location.search, navigate]);

  useEffect(() => {
    const eth = (window as { ethereum?: { request?: (args: { method: string }) => Promise<string[]>; on?: (event: string, handler: (accounts: string[]) => void) => void; removeListener?: (event: string, handler: (accounts: string[]) => void) => void; } }).ethereum;
    if (!eth) return;
    let cancelled = false;

    const update = async () => {
      try {
        const accounts: string[] = await eth.request?.({ method: "eth_accounts" }) || [];
        if (!cancelled) setEvmAddress(accounts && accounts.length ? accounts[0] : null);
      } catch {
        if (!cancelled) setEvmAddress(null);
      }
    };

    update();
    const handler = (accounts: string[]) => setEvmAddress(accounts && accounts.length ? accounts[0] : null);
    eth.on?.("accountsChanged", handler);
    return () => {
      cancelled = true;
      eth.removeListener?.("accountsChanged", handler);
    };
  }, []);

  const walletConnected = useMemo(() => !!evmAddress, [evmAddress]);
  const hasJwt = !!token;
  const isAuthenticated = walletConnected || hasJwt;

  const authMethod = useMemo((): AuthContextType["authMethod"] => {
    if (token && walletConnected) return "both";
    if (token) return "jwt";
    if (walletConnected) return "wallet";
    return "none";
  }, [token, walletConnected]);

  useEffect(() => {
    const protectedPrefixes = ["/dashboard", "/campaigns", "/my-campaigns", "/my-donations"];
    const onProtected = protectedPrefixes.some((p) => location.pathname.startsWith(p));
    if (!isAuthenticated && onProtected) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  const logout = async () => {
    try {
      await privyLogout();
      clearAuthStorage();
      setToken(null);
      setUser(null);
      await auditAuthEvent({ event: "logout", provider: user?.authProvider || "unknown", success: true });
    } finally {
      if (location.pathname !== "/") navigate("/", { replace: true });
    }
  };

  const loginWithWallet = async ({ address, signature, message, walletType }: LoginWithWalletParams) => {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    if (!recoveredAddress || recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      await auditAuthEvent({ event: "wallet_login", provider: walletType, success: false, message: "local signature mismatch" });
      throw new Error("Wallet signature verification failed.");
    }

    try {
      const verifyRes = (await verifyWalletSignature({
        address,
        message,
        signature,
      })) as { success: boolean; data?: AuthPayload; message?: string };

      if (!verifyRes.success || !verifyRes.data?.token || !verifyRes.data?.user) {
        throw new Error(verifyRes.message || "Server wallet verification failed.");
      }

      const normalizedUser = toAuthUserFromPayload(verifyRes.data.user as unknown as Record<string, unknown>);
      persistSession(verifyRes.data.token, { ...normalizedUser, authProvider: "jwt" }, setToken, setUser, setEvmAddress);
      await auditAuthEvent({ event: "wallet_login", provider: walletType, success: true });
      return;
    } catch (error) {
      if (!isInsecureWalletFallbackAllowed()) {
        await auditAuthEvent({ event: "wallet_login", provider: walletType, success: false, message: error instanceof Error ? error.message : "backend verify failed" });
        const msg = error instanceof Error ? error.message : "Wallet authentication failed.";
        throw new Error(`${msg} Enable backend /auth/wallet/verify endpoint or set VITE_ALLOW_INSECURE_WALLET_SESSION=true for local dev only.`);
      }
    }

    const sessionToken = `wallet:${walletType}:${address}:${Date.now()}`;
    const normalizedUser: AuthUser = {
      id: address.toLowerCase(),
      name: `Wallet ${address.slice(0, 6)}...${address.slice(-4)}`,
      role: "user",
      authProvider: "wallet",
      walletAddress: address,
      wallets: [{ provider: walletType, chainType: "evm", address }],
    };

    persistSession(sessionToken, normalizedUser, setToken, setUser, setEvmAddress);
    await auditAuthEvent({ event: "wallet_login_insecure_fallback", provider: walletType, success: true });
  };

  const loginWithPrivy = async (method: PrivyLoginMethod) => {
    const { token: privyToken, user: privyUser } = await loginWithPrivyMethod(method);
    const walletAddress = extractWalletAddress(privyUser);

    try {
      const verifyRes = await verifyPrivyAuth({
        sub: privyUser.id,
        userId: privyUser.id,
        email: extractEmail(privyUser),
        name:
          extractEmail(privyUser)?.split("@")[0] ||
          (walletAddress
            ? `Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : "Privy User"),
        provider: method,
        token: privyToken,
      });

      if (!verifyRes.success || !verifyRes.data?.token || !verifyRes.data?.user) {
        throw new Error(verifyRes.message || "Server Privy verification failed.");
      }

      const normalizedUser = {
        ...toAuthUserFromPayload(verifyRes.data.user as unknown as Record<string, unknown>),
        authProvider: "privy" as const,
        walletAddress,
        wallets: walletAddress
          ? [{ provider: "privy", chainType: "evm" as const, address: walletAddress }]
          : [],
      };

      persistSession(
        verifyRes.data.token,
        normalizedUser,
        setToken,
        setUser,
        setEvmAddress
      );
      await auditAuthEvent({ event: "privy_login", provider: method, success: true });
      return;
    } catch (error) {
      await auditAuthEvent({
        event: "privy_login",
        provider: method,
        success: false,
        message: error instanceof Error ? error.message : "unknown",
      });
      throw error instanceof Error
        ? error
        : new Error("Privy authentication failed.");
    }

    const sessionToken = `wallet:${walletType}:${address}:${Date.now()}`;
    const normalizedUser: AuthUser = {
      id: address.toLowerCase(),
      name: `Wallet ${address.slice(0, 6)}...${address.slice(-4)}`,
      role: "user",
      authProvider: "wallet",
      walletAddress: address,
      wallets: [{ provider: walletType, chainType: "evm", address }],
    };

    persistSession(sessionToken, normalizedUser, setToken, setUser, setEvmAddress);
    await auditAuthEvent({ event: "wallet_login_insecure_fallback", provider: walletType, success: true });
  };

  const loginWithPrivy = async (method: PrivyLoginMethod) => {
    const { token: privyToken, user: privyUser } = await loginWithPrivyMethod(method);
    const walletAddress = extractWalletAddress(privyUser);

    const normalizedUser: AuthUser = {
      id: privyUser.id || walletAddress || `privy-${Date.now()}`,
      name: extractEmail(privyUser)?.split("@")[0] || (walletAddress ? `Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Privy User"),
      email: extractEmail(privyUser),
      role: "user",
      authProvider: "privy",
      walletAddress,
      wallets: walletAddress ? [{ provider: "privy", chainType: "evm", address: walletAddress }] : [],
    };

    persistSession(privyToken, normalizedUser, setToken, setUser, setEvmAddress);
    await auditAuthEvent({ event: "privy_login", provider: method, success: true });
  };

  const value: AuthContextType = {
    isAuthenticated,
    hasJwt,
    walletConnected,
    authMethod,
    user,
    token,
    logout,
    loginWithWallet,
    loginWithPrivy,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
