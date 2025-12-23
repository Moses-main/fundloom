// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearAuth as clearAuthStorage } from "@/lib/api";
import { useAccount } from "@starknet-react/core";

export type AuthUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  // Optional wallet fields hydrated from backend /auth/me
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
  // derived states
  isAuthenticated: boolean;
  hasJwt: boolean;
  walletConnected: boolean;
  authMethod: "none" | "jwt" | "wallet" | "both";
  user: AuthUser | null;
  token: string | null;
  // actions
  logout: () => Promise<void>;
  loginWithWallet: (params: LoginWithWalletParams) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // JWT from localStorage
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Wallets
  const { address: starknetAddress } = useAccount();
  const [evmAddress, setEvmAddress] = useState<string | null>(null);

  // Router
  const navigate = useNavigate();
  const location = useLocation();

  // Read JWT on mount and when localStorage changes (multi-tab)
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
    const onStorage = (e: StorageEvent) => {
      if (e.key === "auth_token" || e.key === "auth_user") {
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
        } catch {}
      }
    };
    const onAuthChanged = () => {
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
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("auth_changed", onAuthChanged as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth_changed", onAuthChanged as EventListener);
    };
  }, []);

  // Detect EVM wallet (MetaMask) connection + listen for changes
  useEffect(() => {
    const eth = (window as any)?.ethereum;
    if (!eth) return;
    let cancelled = false;
    const update = async () => {
      try {
        const accounts: string[] = await eth.request?.({ method: "eth_accounts" });
        if (!cancelled) setEvmAddress(accounts && accounts.length ? accounts[0] : null);
      } catch {}
    };
    update();
    const handler = (accounts: string[]) => setEvmAddress(accounts && accounts.length ? accounts[0] : null);
    eth.on?.("accountsChanged", handler);
    return () => {
      cancelled = true;
      eth.removeListener?.("accountsChanged", handler);
    };
  }, []);

  const walletConnected = useMemo(() => !!starknetAddress || !!evmAddress, [starknetAddress, evmAddress]);
  const hasJwt = !!token;
  const isAuthenticated = walletConnected || hasJwt;
  const authMethod = ((): "none" | "jwt" | "wallet" | "both" => {
    if (hasJwt && walletConnected) return "both";
    if (hasJwt) return "jwt";
    if (walletConnected) return "wallet";
    return "none";
  })();

  // If we have a token but user.id is missing, fetch /auth/me to hydrate
  useEffect(() => {
    const maybeHydrate = async () => {
      if (!hasJwt) return;
      if (user && (user as any).id) return;
      try {
        const res = await import("@/lib/api").then(m => m.getMe());
        if (res?.success && (res as any).data?.user) {
          const u = (res as any).data.user;
          const normalized = { ...u, id: u.id || u._id };
          // Persist and update state
          try { localStorage.setItem("auth_user", JSON.stringify(normalized)); } catch {}
          setUser(normalized);
        }
      } catch {}
    };
    maybeHydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasJwt, user?.id]);

  // Redirect logic: if user becomes unauthenticated on protected routes, send home. If authed on /auth, go dashboard.
  useEffect(() => {
    const protectedPrefixes = ["/dashboard"]; // extend as needed
    const onProtected = protectedPrefixes.some((p) => location.pathname.startsWith(p));
    if (!isAuthenticated && onProtected) {
      navigate("/", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, location.pathname]);

  // Unified logout: clears JWT and navigates home. Wallets are NOT disconnected here.
  const logout = async () => {
    try {
      // Clear JWT
      clearAuthStorage();
      setToken(null);
      setUser(null);
      // Wallets remain connected; users can disconnect explicitly via UI.
    } finally {
      if (location.pathname !== "/") navigate("/", { replace: true });
    }
  };

  // Handle wallet login
  const loginWithWallet = async ({ address, signature, message, walletType }: LoginWithWalletParams) => {
    try {
      // Call your backend API to authenticate with the wallet
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'}/auth/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          signature,
          message,
          walletType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to authenticate with wallet');
      }

      const data = await response.json();
      
      // Store the JWT token and user data
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
      }
      
      if (data.user) {
        const normalizedUser = { ...data.user, id: data.user.id || data.user._id };
        localStorage.setItem('auth_user', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
      }

      // Update wallet address in state
      setEvmAddress(address);
      
      // Notify other tabs
      window.dispatchEvent(new Event('auth_changed'));
      
    } catch (error: any) {
      console.error('Wallet login error:', error);
      throw error; // Re-throw to be handled by the component
    }
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
