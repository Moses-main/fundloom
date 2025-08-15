"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Wallet, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { WalletConnectorModal } from "@/components/modal/WalletConnector";
import { useAccount as useStarknetAccount } from "@starknet-react/core";

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  popular?: boolean;
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
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "🔵",
    description: "Connect using Coinbase Wallet (coming soon)",
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

  const navigate = useNavigate();

  // If StarkNet is connected via modal, reflect it here
  useEffect(() => {
    if (starknetAddress) {
      setConnectedWallet("starknet");
      // Seamless onboarding: go to dashboard when connected
      navigate("/dashboard");
    }
  }, [starknetAddress]);

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
          alert("MetaMask not detected. Please install MetaMask and try again.");
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
      if (walletId === "starknet") {
        // Render modal-driven connect button below; here we no-op and let the user click modal
        return;
      }
      alert("This wallet option is coming soon.");
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
    const wallet = walletOptions.find((w) => w.id === connectedWallet) || {
      name: connectedWallet,
    } as any;
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
                  {wallet?.name} • {(evmAddress || starknetAddress)?.slice(0,6)}...{(evmAddress || starknetAddress)?.slice(-4)}
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
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => connectWallet(wallet.id)}
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
