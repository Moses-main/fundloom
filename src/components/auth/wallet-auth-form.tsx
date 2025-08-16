"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Wallet, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { WalletConnectorModal } from "@/components/modal/WalletConnector";
import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { Connector, useConnect } from "@starknet-react/core";
import { StarknetkitConnector, useStarknetkitConnectModal } from "starknetkit";

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  popular?: boolean;
  disabled?: boolean;
}

const walletOptions: WalletOption[] = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "🦊",
    description: "Connect using MetaMask wallet",
    popular: true,
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    icon: "🔗",
    description: "Connect with WalletConnect protocol (coming soon)",
    disabled: true,
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "🔵",
    description: "Connect using Coinbase Wallet",
  },
  {
    id: "starknet",
    name: "StarkNet Wallets",
    icon: "⭐",
    description: "Connect ArgentX or Braavos via modal",
  },
];

interface WalletAuthFormProps {
  mode: "login" | "signup";
}

export function WalletAuthForm({ mode }: WalletAuthFormProps) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const { address: starknetAddress } = useStarknetAccount();
  const { connect, connectors } = useConnect();
  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: connectors as StarknetkitConnector[],
  });

  const navigate = useNavigate();

  // If StarkNet is connected via modal, reflect it here
  useEffect(() => {
    if (starknetAddress) {
      setConnectedWallet("starknet");
      // Seamless onboarding: go to dashboard when connected
      navigate("/dashboard");
    }
  }, [starknetAddress]);

  // Detect existing EVM connection and react to account changes
  useEffect(() => {
    const ethAny = (window as any)?.ethereum;
    if (!ethAny) return;
    const providers: any[] = ethAny.providers?.length
      ? ethAny.providers
      : [ethAny];
    const metamask =
      providers.find((p) => p?.isMetaMask) ||
      (ethAny.isMetaMask ? ethAny : null);
    const coinbase =
      providers.find((p) => p?.isCoinbaseWallet) ||
      (ethAny.isCoinbaseWallet ? ethAny : null);
    const sync = async () => {
      try {
        const [cb, mm]: any[] = await Promise.all([
          coinbase?.request?.({ method: "eth_accounts" }).catch(() => []),
          metamask?.request?.({ method: "eth_accounts" }).catch(() => []),
        ]);
        const cbAcc = cb && cb.length ? cb[0] : null;
        const mmAcc = mm && mm.length ? mm[0] : null;
        if (cbAcc) {
          setEvmAddress(cbAcc);
          setConnectedWallet((w) => w ?? "coinbase");
        } else if (mmAcc) {
          setEvmAddress(mmAcc);
          setConnectedWallet((w) => w ?? "metamask");
        }
      } catch {}
    };
    sync();
    const mmHandler = (accounts: string[]) => {
      const acc = accounts && accounts.length ? accounts[0] : null;
      if (acc) {
        setEvmAddress(acc);
        setConnectedWallet("metamask");
      } else if (connectedWallet === "metamask") {
        setEvmAddress(null);
        setConnectedWallet(null);
      }
    };
    const cbHandler = (accounts: string[]) => {
      const acc = accounts && accounts.length ? accounts[0] : null;
      if (acc) {
        setEvmAddress(acc);
        setConnectedWallet("coinbase");
      } else if (connectedWallet === "coinbase") {
        setEvmAddress(null);
        setConnectedWallet(null);
      }
    };
    metamask?.on?.("accountsChanged", mmHandler);
    coinbase?.on?.("accountsChanged", cbHandler);
    return () => {
      metamask?.removeListener?.("accountsChanged", mmHandler);
      coinbase?.removeListener?.("accountsChanged", cbHandler);
    };
  }, []);

  const isConnected = useMemo(
    () => !!evmAddress || !!starknetAddress,
    [evmAddress, starknetAddress]
  );

  const connectWallet = async (walletId: string) => {
    setIsConnecting(walletId);
    try {
      if (walletId === "metamask") {
        const eth = (window as any).ethereum;
        if (!eth || !eth.request) {
          alert(
            "MetaMask not detected. Please install MetaMask and try again."
          );
          return;
        }
        const accounts: string[] = await eth.request({
          method: "eth_requestAccounts",
        });
        if (accounts && accounts.length > 0) {
          setEvmAddress(accounts[0]);
          setConnectedWallet("metamask");
          navigate("/dashboard");
        }
        return;
      }
      if (walletId === "coinbase") {
        const ethAny = (window as any).ethereum;
        const provider =
          ethAny?.providers?.find?.((p: any) => p?.isCoinbaseWallet) ||
          (ethAny?.isCoinbaseWallet ? ethAny : null);
        if (!provider || !provider.request) {
          alert(
            "Coinbase Wallet not detected. Please install Coinbase Wallet extension and try again."
          );
          return;
        }
        const accounts: string[] = await provider.request({
          method: "eth_requestAccounts",
        });
        if (accounts && accounts.length > 0) {
          setEvmAddress(accounts[0]);
          setConnectedWallet("coinbase");
          navigate("/dashboard");
        }
        return;
      }
      if (walletId === "starknet") {
        // Open StarkNet modal and connect
        const { connector } = await starknetkitConnectModal();
        if (connector) {
          await connect({ connector: connector as Connector });
          setConnectedWallet("starknet");
          navigate("/dashboard");
        }
        return;
      }
      alert(
        `${walletId} is not supported yet. Please use MetaMask, Coinbase, or StarkNet.`
      );
    } catch (error) {
      console.error("Wallet connection error:", error);
    } finally {
      setIsConnecting(null);
    }
  };

  const disconnectWallet = () => {
    setConnectedWallet(null);
    setEvmAddress(null);
    navigate("/");
  };

  if (isConnected) {
    const wallet =
      walletOptions.find((w) => w.id === connectedWallet) ||
      ({
        name: connectedWallet,
      } as any);
    return (
      <div className="space-y-4">
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-800 dark:text-green-200">
                  Wallet Connected
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {wallet?.name} •{" "}
                  {(evmAddress || starknetAddress)?.slice(0, 6)}...
                  {(evmAddress || starknetAddress)?.slice(-4)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button className="w-full" size="lg">
            {mode === "login" ? "Continue with Wallet" : "Create Account"}
          </Button>
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={disconnectWallet}
          >
            Disconnect Wallet
          </Button>
          <div className="text-center">
            <a
              href="/forgot-wallet"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Forgot wallet?
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <Wallet className="h-12 w-12 text-blue-600 mx-auto" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {mode === "login"
            ? "Connect your wallet to sign in securely"
            : "Connect your wallet to create your account"}
        </p>
      </div>

      <div className="space-y-3">
        {walletOptions.map((wallet) => (
          <Card
            key={wallet.id}
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              wallet.disabled
                ? "opacity-60 cursor-not-allowed pointer-events-none"
                : ""
            }`}
            onClick={() => {
              if (!wallet.disabled) connectWallet(wallet.id);
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{wallet.icon}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{wallet.name}</span>
                      {wallet.popular && (
                        <Badge variant="secondary" className="text-xs">
                          Popular
                        </Badge>
                      )}
                      {wallet.disabled && (
                        <Badge variant="secondary" className="text-xs">
                          Soon
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {wallet.description}
                    </p>
                  </div>
                </div>
                {isConnecting === wallet.id ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                ) : (
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                )}
              </div>
              {wallet.id === "starknet" && (
                <div className="mt-3">
                  <WalletConnectorModal />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium">New to crypto wallets?</p>
            <p className="mt-1">
              We recommend starting with MetaMask. It's secure, easy to use, and
              works with most devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
