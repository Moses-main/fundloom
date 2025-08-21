// src/lib/evm.ts
// Lightweight EVM helpers built on ethers for MetaMask connection, signing, and contract calls

import {
  BrowserProvider,
  Contract,
  formatEther,
  getAddress,
  parseEther,
} from "ethers";
import ABI from "../abi/ABI.json" assert { type: "json" };

export type EvmConnectResult = {
  address: string;
  chainId: string;
};

export function getEthereum(): any | null {
  if (typeof window === "undefined") return null;
  return (window as any).ethereum || null;
}

export async function ensureProvider(): Promise<BrowserProvider> {
  const eth = getEthereum();
  if (!eth) throw new Error("MetaMask not detected. Please install MetaMask.");
  return new BrowserProvider(eth);
}

export async function connectWallet(): Promise<EvmConnectResult> {
  const eth = getEthereum();
  if (!eth) throw new Error("MetaMask not detected. Please install MetaMask.");
  const accounts: string[] = await eth.request({
    method: "eth_requestAccounts",
  });
  if (!accounts || accounts.length === 0)
    throw new Error("No accounts returned by MetaMask");
  const chainId: string = await eth.request({ method: "eth_chainId" });
  return { address: getAddress(accounts[0]), chainId };
}

export async function signMessage(
  message: string
): Promise<{ address: string; signature: string }> {
  const provider = await ensureProvider();
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const signature = await signer.signMessage(message);
  return { address: getAddress(address), signature };
}

export type DonateParams = {
  contractAddress: string;
  campaignId: bigint | number | string;
  valueEth: string; // human-readable, e.g. "0.05"
};

export async function donateEth({
  contractAddress,
  campaignId,
  valueEth,
}: DonateParams): Promise<string> {
  const provider = await ensureProvider();
  const signer = await provider.getSigner();
  const contract = new Contract(contractAddress, ABI as any, signer);
  const tx = await contract.donate(BigInt(campaignId), {
    value: parseEther(valueEth),
  });
  const receipt = await tx.wait();
  return receipt?.hash || tx.hash;
}

export async function getSelectedAddress(): Promise<string | null> {
  const eth = getEthereum();
  if (!eth) return null;
  const accounts: string[] = await eth.request({ method: "eth_accounts" });
  return accounts && accounts.length ? getAddress(accounts[0]) : null;
}

export async function switchOrAddChain(target: {
  chainIdHex: string;
  rpcUrls?: string[];
  chainName?: string;
  nativeCurrency?: { name: string; symbol: string; decimals: number };
  blockExplorerUrls?: string[];
}) {
  const eth = getEthereum();
  if (!eth) throw new Error("MetaMask not detected.");
  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: target.chainIdHex }],
    });
  } catch (err: any) {
    if (
      err?.code === 4902 &&
      target.rpcUrls &&
      target.chainName &&
      target.nativeCurrency
    ) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [target],
      });
      return;
    }
    throw err;
  }
}
