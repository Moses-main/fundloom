"use client";

import {
  Connector,
  useAccount,
  useConnect,
  useDisconnect,
} from "@starknet-react/core";
import { StarknetkitConnector, useStarknetkitConnectModal } from "starknetkit";
import { clearAuth } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export function WalletConnectorModal() {
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();

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

  if (!address) {
    return (
      <button
        onClick={connectWallet}
        className=" text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors p-4"
      >
        Connect Wallet
      </button>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="p-2 bg-gray-100 rounded-lg ">
        Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
      </div>
      <button
        onClick={() => {
          try { disconnect(); } catch {}
          clearAuth();
          navigate("/");
        }}
        className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
      >
        Disconnect
      </button>
    </div>
  );
}
