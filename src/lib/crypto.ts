// src/lib/crypto.ts
// Minimal EVM wallet helpers using the injected provider (e.g., MetaMask)

export const hasEthereum = () => typeof window !== "undefined" && (window as any).ethereum;

export async function ensureWalletConnected(): Promise<string> {
  const eth = (window as any).ethereum;
  if (!eth) throw new Error("No wallet found. Please install MetaMask or a compatible wallet.");
  const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
  if (!accounts || accounts.length === 0) throw new Error("Wallet connection rejected");
  return accounts[0];
}

function toHexWeiFromEth(amountEth: string | number): string {
  const ethStr = String(amountEth).trim();
  if (!ethStr || isNaN(Number(ethStr))) throw new Error("Invalid amount");
  // Convert ETH to wei using BigInt to avoid precision issues
  // 1 ETH = 1e18 wei
  const [intPart, fracPartRaw] = ethStr.split(".");
  const fracPart = (fracPartRaw || "").slice(0, 18); // up to 18 decimals
  const paddedFrac = (fracPart + "0".repeat(18)).slice(0, 18);
  const wei = BigInt(intPart || "0") * 10n ** 18n + BigInt(paddedFrac || "0");
  return "0x" + wei.toString(16);
}

export async function sendEth({ to, amountEth }: { to: string; amountEth: string | number }) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(to)) throw new Error("Invalid recipient address");
  const eth = (window as any).ethereum;
  if (!eth) throw new Error("No wallet found. Please install MetaMask or a compatible wallet.");
  const from = await ensureWalletConnected();
  const value = toHexWeiFromEth(amountEth);
  const txHash: string = await eth.request({
    method: "eth_sendTransaction",
    params: [
      {
        from,
        to,
        value,
      },
    ],
  });
  return txHash;
}
