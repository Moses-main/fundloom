import React, { useEffect, useState } from "react";
import { EVM_CAIP2, EVM_CHAIN_ID_HEX, EVM_CONTRACT_ADDRESS, EVM_USDC_ADDRESS, EVM_USDT_ADDRESS } from "@/utils/constant";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAccount } from "@starknet-react/core";
import { useAuth } from "@/context/AuthContext";
import { Copy, Check } from "lucide-react";

const WalletTab: React.FC = () => {
  const { address: starknetAddress } = useAccount();
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

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

  // Prefer authenticated user's Privy wallet address if available
  const displayAddr = (user?.walletAddress || starknetAddress || evmAddress) ?? null;

  const handleCopy = async () => {
    if (!displayAddr) return;
    try {
      await navigator.clipboard.writeText(displayAddr);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Wallet</h2>
        <p className="text-sm text-muted-foreground">
          Network: <span className="font-mono">{EVM_CAIP2}</span> (chainId hex {EVM_CHAIN_ID_HEX})
        </p>
        <div className="mt-2 text-sm flex items-center gap-2">
          <span className="text-muted-foreground">Address:</span>
          {displayAddr ? (
            <>
              <span className="font-mono break-all">{displayAddr}</span>
              <Button variant="ghost" size="icon" aria-label="Copy address" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </>
          ) : (
            <span className="text-muted-foreground">Not connected</span>
          )}
        </div>
      </div>

      <Card className="p-4 space-y-3">
        <h3 className="text-lg font-medium">Campaign Balances</h3>
        <p className="text-sm text-muted-foreground">
          This section will show per-campaign balances (ETH, USDC, USDT) on the active EVM network and allow withdrawals using your Privy wallet.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="rounded-lg border p-3">
            <div className="text-sm text-muted-foreground">ETH</div>
            <div className="text-xl font-semibold">--</div>
            <Button className="mt-2" disabled>
              Withdraw ETH
            </Button>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm text-muted-foreground">USDC</div>
            <div className="text-xl font-semibold">--</div>
            <Button className="mt-2" disabled={EVM_USDC_ADDRESS === "0x0000000000000000000000000000000000000000"}>
              Withdraw USDC
            </Button>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm text-muted-foreground">USDT</div>
            <div className="text-xl font-semibold">--</div>
            <Button className="mt-2" disabled={EVM_USDT_ADDRESS === "0x0000000000000000000000000000000000000000"}>
              Withdraw USDT
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <h3 className="text-lg font-medium">Networks</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-lg border p-3">
            <div className="text-sm text-muted-foreground">Base</div>
            <div className="text-sm">Active</div>
          </div>
          <div className="rounded-lg border p-3 opacity-60">
            <div className="text-sm text-muted-foreground">Starknet</div>
            <div className="text-sm">Coming soon</div>
          </div>
          <div className="rounded-lg border p-3 opacity-60">
            <div className="text-sm text-muted-foreground">Avalanche</div>
            <div className="text-sm">Coming soon</div>
          </div>
          <div className="rounded-lg border p-3 opacity-60">
            <div className="text-sm text-muted-foreground">BSC</div>
            <div className="text-sm">Coming soon</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WalletTab;
