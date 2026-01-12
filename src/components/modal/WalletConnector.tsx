"use client";

import { clearAuth, requestWalletNonce, verifyWalletSignature, setAuth } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { connectWallet as evmConnect, signMessage, getEthereum } from "@/lib/evm";
import { useState } from "react";

export function WalletConnectorModal() {
  const navigate = useNavigate();
  const [evmStatus, setEvmStatus] = useState<"idle" | "connecting" | "signing" | "verifying" | "done" | "error">("idle");
  const [evmError, setEvmError] = useState<string | null>(null);

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
    </div>
  );
}
