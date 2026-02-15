"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Wallet, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useAuth } from "@/context/AuthContext";
import { formatAddress, isMobile } from "@/lib/utils";
import { providers } from "ethers";

interface WalletAuthFormProps {
  mode: "login" | "signup";
}

type WalletChoice = "metamask" | "walletconnect" | "coinbase";

const isInjectedWalletAvailable = typeof window.ethereum !== "undefined";
const isMobileDevice = isMobile();

export function WalletAuthForm({ mode }: WalletAuthFormProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { show: toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithWallet, logout, isAuthenticated } = useAuth();

  const next = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("next") || "/dashboard";
  }, [location.search]);

  useEffect(() => {
    if (isAuthenticated) navigate(next, { replace: true });
  }, [isAuthenticated, navigate, next]);

  useEffect(() => {
    const eth = (window as any)?.ethereum;
    if (!eth) return;
    const handler = (accounts: string[]) => {
      setEvmAddress(accounts?.[0] || null);
    };
    eth.on?.("accountsChanged", handler);
    return () => eth.removeListener?.("accountsChanged", handler);
  }, []);

  const connectMetaMask = async () => {
    if (!isInjectedWalletAvailable) {
      if (isMobileDevice) {
        window.open(`https://metamask.app.link/dapp/${window.location.host}`, "_blank");
      } else {
        window.open("https://metamask.io/download.html", "_blank");
      }
      throw new Error("MetaMask is required to continue.");
    }

    const web3 = new providers.Web3Provider((window as any).ethereum, "any");
    const accounts = await web3.send("eth_requestAccounts", []);
    if (!accounts?.length) throw new Error("No wallet account found.");

    const signer = web3.getSigner();
    const message = `Welcome to FundLoom!\n\nMode: ${mode}\nNonce: ${Date.now()}`;
    const signature = await signer.signMessage(message);

    await loginWithWallet({
      address: accounts[0],
      signature,
      message,
      walletType: "metamask",
    });

    setEvmAddress(accounts[0]);
    toast({
      type: "success",
      title: "Wallet connected",
      description: `Connected ${formatAddress(accounts[0])}`,
    });
  };

  const handleConnect = async (wallet: WalletChoice) => {
    setError(null);
    setIsConnecting(true);
    try {
      if (wallet !== "metamask") {
        toast({
          type: "info",
          title: "Coming soon",
          description: `${wallet} support is temporarily disabled while we stabilize EVM auth.`,
        });
        return;
      }
      await connectMetaMask();
      navigate(next, { replace: true });
    } catch (e: any) {
      const msg = e?.message || "Failed to connect wallet.";
      setError(msg);
      toast({ type: "error", title: "Connection failed", description: msg });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await logout();
    setEvmAddress(null);
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          <h3 className="font-semibold">Wallet authentication</h3>
        </div>

        {error && (
          <div className="text-sm rounded border border-red-300 bg-red-50 text-red-700 px-3 py-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {evmAddress ? (
          <div className="space-y-3">
            <div className="text-sm rounded border border-green-300 bg-green-50 text-green-700 px-3 py-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Connected: {formatAddress(evmAddress)}</span>
            </div>
            <Button variant="outline" className="w-full" onClick={handleDisconnect}>
              Disconnect Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button className="w-full" onClick={() => handleConnect("metamask")} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect with MetaMask"}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handleConnect("walletconnect")}>
              WalletConnect (coming soon)
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handleConnect("coinbase")}>
              Coinbase Wallet (coming soon)
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          By connecting your wallet, you agree to sign a one-time message for authentication.
        </p>
      </CardContent>
    </Card>
  );
}

