// hooks/useWallet.ts
// Real EVM wallet hook using MetaMask via src/lib/evm

import { useEffect, useState } from "react";
import { connectWallet as evmConnect, getSelectedAddress, getEthereum } from "@/lib/evm";

export const useWallet = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const addr = await getSelectedAddress();
        if (!cancelled) {
          setUserAddress(addr || "");
          setWalletConnected(!!addr);
        }
      } catch {}
    };
    init();
    const eth = getEthereum();
    if (eth?.on) {
      const handler = (accounts: string[]) => {
        const a = accounts && accounts.length ? accounts[0] : "";
        setUserAddress(a);
        setWalletConnected(!!a);
      };
      eth.on("accountsChanged", handler);
      return () => eth.removeListener?.("accountsChanged", handler);
    }
  }, []);

  const connectWallet = async () => {
    setError(null);
    setConnecting(true);
    try {
      const { address } = await evmConnect();
      setUserAddress(address);
      setWalletConnected(true);
    } catch (e: any) {
      setError(e?.message || "Failed to connect MetaMask");
      setWalletConnected(false);
      setUserAddress("");
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    // MetaMask doesn't offer programmatic disconnect; we just clear local state.
    setWalletConnected(false);
    setUserAddress("");
  };

  return {
    walletConnected,
    userAddress,
    connecting,
    error,
    connectWallet,
    disconnectWallet,
  } as const;
};
