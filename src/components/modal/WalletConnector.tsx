"use client";

import {
  Connector,
  useAccount,
  useConnect,
  useDisconnect,
} from "@starknet-react/core";
import { StarknetkitConnector, useStarknetkitConnectModal } from "starknetkit";
import { clearAuth, requestWalletNonce, verifyWalletSignature, setAuth } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { connectWallet as evmConnect, signMessage, getEthereum } from "@/lib/evm";
import { useState } from "react";

export function WalletConnectorModal() {
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const [evmStatus, setEvmStatus] = useState<"idle" | "connecting" | "signing" | "verifying" | "done" | "error">("idle");
  const [evmError, setEvmError] = useState<string | null>(null);

  const { connect, connectors } = useConnect();
  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: connectors as StarknetkitConnector[],
  });

  async function connectWallet() {
    const { connector } = await starknetkitConnectModal();
    if (!connector) {
      return;
    }
    await connect({ connector: connector as Connector });
  }

  const { address } = useAccount();

  const handleEvmAuth = async () => {
    setEvmError(null);
    setEvmStatus("connecting");
    try {
      // 1) Request MetaMask connection
      const { address: evmAddress } = await evmConnect();
      // 2) Request nonce from backend
      setEvmStatus("signing");
      const nonceRes = await requestWalletNonce(evmAddress);
      const nonce = (nonceRes as any)?.data?.nonce || (nonceRes as any)?.nonce;
      const msg = nonce ? `FundLoom sign-in:\nAddress: ${evmAddress}\nNonce: ${nonce}` : `FundLoom sign-in for ${evmAddress}`;
      // 3) Sign message
      const { signature } = await signMessage(msg);
      // 4) Verify on backend -> returns JWT
      setEvmStatus("verifying");
      const verifyRes = await verifyWalletSignature({ address: evmAddress, message: msg, signature });
      const payload = (verifyRes as any).data || verifyRes;
      if (!payload?.token || !payload?.user) throw new Error("Wallet verification failed");
      setAuth(payload);
      setEvmStatus("done");
      navigate("/dashboard");
    } catch (e: any) {
      setEvmStatus("error");
      setEvmError(e?.message || "Failed to connect and verify wallet");
    }
  };

  const hasStarknet = !!address;
  const hasEvm = !!getEthereum();

  return (
    <div className="flex flex-col gap-3">
      {/* EVM / MetaMask */}
      <button
        onClick={handleEvmAuth}
        disabled={!hasEvm || evmStatus === "connecting" || evmStatus === "signing" || evmStatus === "verifying"}
        className="px-4 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {hasEvm ? (evmStatus === "idle" || evmStatus === "done" ? "Connect MetaMask" : `MetaMask: ${evmStatus}`) : "Install MetaMask"}
      </button>
      {evmError ? <div className="text-sm text-red-600">{evmError}</div> : null}

      {/* Starknet (existing) */}
      {!hasStarknet ? (
        <button
          onClick={connectWallet}
          className="px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Connect Starknet Wallet
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="p-2 bg-gray-100 rounded-lg ">
            Starknet: {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
          <button
            onClick={() => {
              try { disconnect(); } catch {}
              clearAuth();
              navigate("/");
            }}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Disconnect Starknet
          </button>
        </div>
      )}
    </div>
  );
}
