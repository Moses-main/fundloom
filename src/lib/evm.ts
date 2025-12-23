// src/lib/evm.ts
// Lightweight EVM helpers built on ethers v5 for MetaMask connection, signing, and contract calls

import { providers, Contract, utils } from "ethers";
const { formatEther, parseEther, getAddress } = utils;
const { Web3Provider } = providers;
import ABI from "../abi/ABI.json" assert { type: "json" };

// Minimal ERC20 ABI fragments
const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
];

export type EvmConnectResult = {
  address: string;
  chainId: string;
};

export function getEthereum(): any | null {
  if (typeof window === "undefined") return null;
  return (window as any).ethereum || null;
}

export async function ensureProvider() {
  const eth = getEthereum();
  if (!eth) throw new Error("MetaMask not detected. Please install MetaMask.");
  return new Web3Provider(eth);
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

// --- ERC20 & signing helpers ---
export async function getTokenMeta(tokenAddress: string) {
  const provider = await ensureProvider();
  const erc20 = new Contract(tokenAddress, ERC20_ABI, provider);
  const [decimals, symbol] = await Promise.all([
    erc20.decimals(),
    erc20.symbol(),
  ]);
  return { decimals: Number(decimals), symbol: String(symbol) };
}

export async function ensureAllowance(
  tokenAddress: string,
  owner: string,
  spender: string,
  required: bigint
) {
  const provider = await ensureProvider();
  const signer = await provider.getSigner();
  const erc20 = new Contract(tokenAddress, ERC20_ABI, signer);
  const current: bigint = await erc20.allowance(owner, spender);
  if (current >= required) return;
  const tx = await erc20.approve(spender, required);
  await tx.wait();
}

export async function donateErc20(params: {
  contractAddress: string;
  campaignId: bigint | number | string;
  tokenAddress: string;
  amount: bigint; // raw token units
}): Promise<string> {
  const provider = await ensureProvider();
  const signer = await provider.getSigner();
  const contract = new Contract(params.contractAddress, ABI as any, signer);
  const tx = await contract.donateERC20(
    BigInt(params.campaignId),
    params.tokenAddress,
    params.amount
  );
  const receipt = await tx.wait();
  return receipt?.hash || tx.hash;
}

export async function signDonationMessage(message: string) {
  const provider = await ensureProvider();
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const signature = await signer.signMessage(message);
  return { address: getAddress(address), signature };
}

export async function requireChain(
  chainIdHex: string,
  addParams?: {
    rpcUrls?: string[];
    chainName?: string;
    nativeCurrency?: { name: string; symbol: string; decimals: number };
    blockExplorerUrls?: string[];
  }
) {
  try {
    await switchOrAddChain({ chainIdHex: chainIdHex, ...addParams });
  } catch (e) {
    // surface error to caller
    throw e;
  }
}
