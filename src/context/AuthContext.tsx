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
      setUser(u ? JSON.parse(u) : null);
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
          setUser(u ? JSON.parse(u) : null);
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
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

  const value: AuthContextType = {
    isAuthenticated,
    hasJwt,
    walletConnected,
    authMethod,
    user,
    token,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
