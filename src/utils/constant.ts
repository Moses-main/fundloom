// ===============================
// src/utils/constant.ts
// Active EVM network defaults to Base Sepolia. Override via Vite env.
// ===============================

export const CONTRACT_ADDRESS =
  "0x07d22d21970a6cd6b9fd9dbdef451ff52dc315cda76910142517b034f95da85e"; // Your deployed contract address
export const NETWORK = "sepolia-alpha";

export const ROUTES = {
  HOME: "/",
  CAMPAIGNS: "/campaigns",
  CAMPAIGN_DETAILS: "/campaigns/:id",
  CHARITY_DASHBOARD: "/charity",
  DONOR_DASHBOARD: "/donor",
  ADMIN: "/admin",
} as const;

export const DONATION_AMOUNTS = [
  { label: "0.01 ETH", value: "10000000000000000" },
  { label: "0.05 ETH", value: "50000000000000000" },
  { label: "0.1 ETH", value: "100000000000000000" },
  { label: "0.5 ETH", value: "500000000000000000" },
  { label: "1 ETH", value: "1000000000000000000" },
];

// Optional EVM config for MetaMask + Ethereum Sepolia. Override via Vite env at build time.
export const EVM_CONTRACT_ADDRESS =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_EVM_CONTRACT_ADDRESS) ||
  "0x0000000000000000000000000000000000000000"; // TODO: set actual EVM contract address (Base Sepolia)

// Base Sepolia chainId in hex (84532 -> 0x14A34)
export const EVM_CHAIN_ID_HEX =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_EVM_CHAIN_ID_HEX) ||
  "0x14A34"; // 84532

// CAIP2 identifier for the active EVM network (e.g., eip155:84532 for Base Sepolia)
export const EVM_CAIP2 =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_CAIP2) ||
  "eip155:84532";

// Optional known ERC20 token addresses on the target EVM network
export const EVM_USDC_ADDRESS =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_EVM_USDC_ADDRESS) ||
  "0x0000000000000000000000000000000000000000";
export const EVM_USDT_ADDRESS =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_EVM_USDT_ADDRESS) ||
  "0x0000000000000000000000000000000000000000";
