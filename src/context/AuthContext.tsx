// src/context/AuthContext.tsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { clearAuth as clearAuthStorage } from "@/lib/api";
import { loginWithPrivyMethod, privyLogout, type PrivyLoginMethod, type PrivyUserLike } from "@/lib/privyRuntime";

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

function persistSession(token: string, normalizedUser: AuthUser, setToken: (t: string | null) => void, setUser: (u: AuthUser | null) => void, setEvmAddress: (a: string | null) => void) {
  localStorage.setItem("auth_token", token);
  localStorage.setItem("auth_user", JSON.stringify(normalizedUser));
  setToken(token);
  setUser(normalizedUser);
  setEvmAddress(normalizedUser.walletAddress || null);
  window.dispatchEvent(new Event("auth_changed"));
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
    } finally {
      if (location.pathname !== "/") navigate("/", { replace: true });
    }
  };

  const loginWithWallet = async ({ address, signature, message, walletType }: LoginWithWalletParams) => {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    if (!recoveredAddress || recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      throw new Error("Wallet signature verification failed.");
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
