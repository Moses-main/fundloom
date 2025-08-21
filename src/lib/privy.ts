// src/lib/privy.ts
// Thin wrappers around Privy wallet API for EVM chains.
// Usage expects a Privy client instance (e.g., from window.privy or an imported SDK instance)

export type Caip2 = `eip155:${number}`;

export const Chains = {
  sepolia: { caip2: 'eip155:11155111' as Caip2, chainId: 11155111 },
  base_sepolia: { caip2: 'eip155:84532' as Caip2, chainId: 84532 },
  mainnet: { caip2: 'eip155:1' as Caip2, chainId: 1 },
  base: { caip2: 'eip155:8453' as Caip2, chainId: 8453 },
};

export function getEnvCaip2(): { caip2: Caip2; chainId: number } | null {
  const caip2 = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_CAIP2) as string | undefined;
  if (!caip2) return null;
  const parts = caip2.split(':');
  if (parts.length !== 2 || parts[0] !== 'eip155') return null;
  const id = Number(parts[1]);
  if (!Number.isFinite(id)) return null;
  return { caip2: caip2 as Caip2, chainId: id };
}

export async function privySignMessage(privy: any, walletId: string, message: string) {
  return privy.walletApi.ethereum.signMessage({ walletId, message });
}

export async function privySendTx(
  privy: any,
  walletId: string,
  to: string,
  data: string | undefined,
  valueHex: string | undefined
): Promise<string> {
  const chain = getEnvCaip2() || Chains.sepolia;
  const { hash } = await privy.walletApi.ethereum.sendTransaction({
    walletId,
    caip2: chain.caip2,
    transaction: {
      to,
      ...(data ? { data } : {}),
      ...(valueHex ? { value: valueHex } : {}),
      chainId: chain.chainId,
    },
  });
  return hash;
}
