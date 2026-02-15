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

const SUPPORTED_EVM_CHAIN_IDS = new Set([1, 5, 137, 8453, 84532, 11155111]);

export function WalletAuthForm({ mode }: WalletAuthFormProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<WalletChoice>("metamask");

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
    const handler = (accounts: string[]) => setEvmAddress(accounts?.[0] || null);
    eth.on?.("accountsChanged", handler);
    return () => eth.removeListener?.("accountsChanged", handler);
  }, []);

  const ensureSupportedNetwork = async (web3: providers.Web3Provider) => {
    const network = await web3.getNetwork();
    const chainId = Number(network.chainId);
    if (!SUPPORTED_EVM_CHAIN_IDS.has(chainId)) {
      throw new Error(
        `Unsupported network (${chainId}). Please switch to Ethereum, Base, Polygon, Goerli, Sepolia, or Base Sepolia.`
      );
    }
  };

  const connectMetaMask = async () => {
    const isInjectedWalletAvailable = typeof window !== "undefined" && typeof window.ethereum !== "undefined";

    if (!isInjectedWalletAvailable) {
      if (isMobile()) {
        window.open(`https://metamask.app.link/dapp/${window.location.host}`, "_blank");
      } else {
        window.open("https://metamask.io/download.html", "_blank");
      }
      throw new Error("MetaMask is required to continue.");
    }

    const web3 = new providers.Web3Provider((window as any).ethereum, "any");
    const accounts = await web3.send("eth_requestAccounts", []);
    if (!accounts?.length) throw new Error("No wallet account found.");

    await ensureSupportedNetwork(web3);

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

  const handleConnect = async () => {
    setError(null);
    setIsConnecting(true);
    try {
      if (selectedWallet !== "metamask") {
        toast({
          type: "info",
          title: "Coming soon",
          description: `${selectedWallet} support is temporarily disabled while we stabilize EVM auth.`,
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
    setError(null);
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
            <div className="grid grid-cols-3 gap-2">
              {(["metamask", "walletconnect", "coinbase"] as WalletChoice[]).map((wallet) => (
                <Button
                  key={wallet}
                  type="button"
                  variant={selectedWallet === wallet ? "default" : "outline"}
                  className="capitalize"
                  onClick={() => setSelectedWallet(wallet)}
                >
                  {wallet}
                </Button>
              ))}
            </div>
            <Button className="w-full" onClick={handleConnect} disabled={isConnecting}>
              {isConnecting
                ? "Connecting..."
                : selectedWallet === "metamask"
                ? "Connect with MetaMask"
                : `Connect with ${selectedWallet} (coming soon)`}
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
