// src/components/DonationModal.tsx
import React, { useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Wallet,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Clock3,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import {
  donateEth as contractDonateEth,
  donateErc20,
  ensureAllowance,
  getSelectedAddress,
  getTokenMeta,
  requireChain,
  signDonationMessage,
} from "@/lib/evm";
import {
  EVM_CHAIN_ID_HEX,
  EVM_CONTRACT_ADDRESS,
  EVM_USDC_ADDRESS,
  EVM_USDT_ADDRESS,
} from "@/utils/constant";
import {
  postAuthDonation,
  postGuestDonation,
  recordCryptoDonation,
} from "@/lib/api";
import {
  donationTxStateLabel,
  type DonationTxState,
} from "@/lib/txLifecycle";

const PaymentMethodSelector: React.FC = () => {
  const { selectedPayment, setSelectedPayment } = useAppContext();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => setSelectedPayment("crypto")}
        className={`px-3 py-3 rounded-xl border min-w-[calc(50%-0.25rem)] sm:min-w-[110px] flex-1 sm:flex-none ${
          selectedPayment === "crypto"
            ? "bg-blue-50 border-blue-200"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center space-x-2">
          <Wallet className="h-4 w-4" />
          <span className="text-sm">Crypto</span>
        </div>
      </button>
      <button
        onClick={() => setSelectedPayment("card")}
        className={`px-3 py-3 rounded-xl border min-w-[calc(50%-0.25rem)] sm:min-w-[110px] flex-1 sm:flex-none ${
          selectedPayment === "card"
            ? "bg-blue-50 border-blue-200"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center space-x-2">
          <CreditCard className="h-4 w-4" />
          <span className="text-sm">Card</span>
        </div>
      </button>
      <button
        onClick={() => setSelectedPayment("bank")}
        className={`px-3 py-3 rounded-xl border min-w-[calc(50%-0.25rem)] sm:min-w-[110px] flex-1 sm:flex-none ${
          selectedPayment === "bank"
            ? "bg-blue-50 border-blue-200"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center space-x-2">
          <Banknote className="h-4 w-4" />
          <span className="text-sm">Bank</span>
        </div>
      </button>
      <button
        onClick={() => setSelectedPayment("mobile")}
        className={`px-3 py-3 rounded-xl border min-w-[calc(50%-0.25rem)] sm:min-w-[110px] flex-1 sm:flex-none ${
          selectedPayment === "mobile"
            ? "bg-blue-50 border-blue-200"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center space-x-2">
          <Smartphone className="h-4 w-4" />
          <span className="text-sm">Mobile</span>
        </div>
      </button>
    </div>
  );
};

const chainIdHexToDecString = (hex: string) => {
  try {
    return BigInt(hex).toString();
  } catch {
    return "0";
  }
};

const txStateMeta = (state: DonationTxState) => {
  switch (state) {
    case "initiated":
    case "wallet_prompt":
      return {
        icon: Loader2,
        className: "text-blue-700 bg-blue-50 border-blue-100",
      };
    case "pending":
      return {
        icon: Clock3,
        className: "text-amber-700 bg-amber-50 border-amber-100",
      };
    case "confirmed":
      return {
        icon: CheckCircle,
        className: "text-emerald-700 bg-emerald-50 border-emerald-100",
      };
    case "failed":
      return {
        icon: AlertTriangle,
        className: "text-red-700 bg-red-50 border-red-100",
      };
    default:
      return null;
  }
};

const DonationModal: React.FC = () => {
  const {
    selectedCampaign,
    setShowDonationModal,
    setSelectedCampaign,
    getProgressPercentage,
    formatAmount,
    donationAmount,
    setDonationAmount,
    donationMessage,
    setDonationMessage,
    selectedPayment,
    setSelectedPayment,
    userName,
    setUserName,
  } = useAppContext();

  const [donorEmail, setDonorEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState<"ETH" | "USDC" | "USDT">("ETH");
  const [txState, setTxState] = useState<DonationTxState>("idle");
  const [txHash, setTxHash] = useState<string>("");
  const [txError, setTxError] = useState<string>("");

  const tokenAddress = useMemo(() => {
    if (token === "USDC") return EVM_USDC_ADDRESS;
    if (token === "USDT") return EVM_USDT_ADDRESS;
    return "0x0000000000000000000000000000000000000000";
  }, [token]);

  const backendId =
    (selectedCampaign as any)?.backendId || (selectedCampaign as any)?._id;
  const { show: toast } = useToast();

  const chainSwitchConfig = useMemo(() => {
    const env = (import.meta as any).env || {};
    const rpcCandidate =
      EVM_CHAIN_ID_HEX.toLowerCase() === "0x14a34"
        ? env.VITE_RPC_BASE_SEPOLIA
        : env.VITE_RPC_BASE_MAINNET;

    const rpcUrls = rpcCandidate ? [String(rpcCandidate)] : undefined;
    const chainName =
      EVM_CHAIN_ID_HEX.toLowerCase() === "0x14a34"
        ? "Base Sepolia"
        : "Base";
    return {
      chainIdHex: EVM_CHAIN_ID_HEX,
      rpcUrls,
      chainName,
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      blockExplorerUrls:
        EVM_CHAIN_ID_HEX.toLowerCase() === "0x14a34"
          ? ["https://sepolia.basescan.org"]
          : ["https://basescan.org"],
    };
  }, []);

  if (!selectedCampaign) return null;

  const stateMeta = txStateMeta(txState);
  const StateIcon = stateMeta?.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-lg w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Make a Donation</h3>
          <button
            onClick={() => {
              setShowDonationModal(false);
              setSelectedCampaign(null);
              setTxState("idle");
              setTxHash("");
              setTxError("");
              if (window.history && window.history.replaceState) {
                const cleanUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, "", cleanUrl);
              }
            }}
            className="text-gray-400 hover:text-gray-600 w-9 h-9 -mr-1 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">{selectedCampaign.title}</h4>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              style={{
                width: `${getProgressPercentage(
                  selectedCampaign.raised_amount,
                  selectedCampaign.target_amount
                )}%`,
              }}
            />
          </div>
          <p className="text-sm text-gray-600">
            ${formatAmount(selectedCampaign.raised_amount)} of $
            {formatAmount(selectedCampaign.target_amount)} raised
          </p>
        </div>

        {stateMeta && StateIcon && (
          <div className={`mb-4 rounded-xl border p-3 ${stateMeta.className}`}>
            <div className="flex items-center gap-2 text-sm font-medium">
              <StateIcon
                className={`h-4 w-4 ${
                  txState === "initiated" || txState === "wallet_prompt"
                    ? "animate-spin"
                    : ""
                }`}
              />
              {donationTxStateLabel(txState)}
            </div>
            {txHash && (
              <p className="text-xs mt-1 break-all">Transaction: {txHash}</p>
            )}
            {txError && <p className="text-xs mt-1">{txError}</p>}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your name (optional)
            </label>
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              placeholder="Anonymous"
            />
          </div>

          {selectedPayment === "card" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (required for card payments)
              </label>
              <input
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                placeholder="you@example.com"
                required
              />
              {!backendId && (
                <p className="text-xs text-red-600 mt-2">
                  This campaign isn't synced with the server yet. Please
                  create/select a server-backed campaign to use card payments.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedPayment === "crypto" ? "Amount" : "Donation Amount ($)"}
            </label>
            <input
              type="number"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              placeholder={selectedPayment === "crypto" ? "e.g. 0.01" : "Enter amount"}
            />
            {selectedPayment === "crypto" && (
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Token
                </label>
                <select
                  value={token}
                  onChange={(e) => setToken(e.target.value as "ETH" | "USDC" | "USDT")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                </select>
                <p className="text-[11px] text-gray-500 mt-1">
                  Transaction will run through chain checks, wallet signature,
                  and on-chain confirmation tracking.
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={donationMessage}
              onChange={(e) => setDonationMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              placeholder="Leave a message of support..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <PaymentMethodSelector />
            <p className="text-xs text-gray-500 mt-2">
              Crypto uses browser wallet. Card/bank/mobile are simulated and
              still backend-dependent.
            </p>
          </div>

          <ActionButton
            submitting={submitting}
            state={txState}
            disabled={
              !donationAmount ||
              (selectedPayment === "card" && (!donorEmail || !backendId))
            }
            onClick={async () => {
              const amountNum = parseFloat(donationAmount || "0");
              if (!selectedCampaign || !amountNum || amountNum <= 0) return;

              if (selectedPayment === "card") {
                try {
                  setSubmitting(true);
                  setTxState("initiated");
                  setTxError("");
                  if (!backendId) {
                    setSubmitting(false);
                    setTxState("failed");
                    setTxError("Server-backed campaign required for card flow.");
                    return;
                  }
                  const { initPaystackCard } = await import("../lib/api");
                  const resp = await initPaystackCard({
                    campaignId: String(backendId),
                    amount: amountNum,
                    email: donorEmail.trim(),
                    donorName: userName || undefined,
                    isAnonymous: !userName,
                    message: donationMessage || undefined,
                  });
                  if (resp?.success && (resp.data as any)?.authorizationUrl) {
                    window.location.href = (resp.data as any).authorizationUrl;
                  } else {
                    throw new Error(resp?.message || "Failed to initialize Paystack");
                  }
                } catch (e: any) {
                  setTxState("failed");
                  setTxError(e?.message || "Failed to start card payment.");
                  toast({
                    type: "error",
                    title: "Payment init failed",
                    description: e?.message || "Failed to start card payment.",
                  });
                } finally {
                  setSubmitting(false);
                }
                return;
              }

              try {
                setSubmitting(true);
                setTxError("");
                setTxHash("");
                setTxState("initiated");

                const eth = (window as any).ethereum;
                if (!eth) {
                  throw new Error("No wallet found. Install MetaMask or compatible wallet.");
                }

                const currentChainId = await eth.request({ method: "eth_chainId" });
                if (
                  String(currentChainId).toLowerCase() !==
                  String(EVM_CHAIN_ID_HEX).toLowerCase()
                ) {
                  toast({
                    type: "info",
                    title: "Switching network",
                    description: `Switching wallet to required chain (${chainSwitchConfig.chainName}).`,
                  });
                }

                await requireChain(chainSwitchConfig.chainIdHex, chainSwitchConfig);

                const from = await getSelectedAddress();
                if (!from) throw new Error("Connect MetaMask first.");

                setTxState("wallet_prompt");
                const signMsg = `I am donating ${donationAmount} ${token} to campaign: ${selectedCampaign.title}`;
                await signDonationMessage(signMsg);

                const contractAddress = EVM_CONTRACT_ADDRESS;
                if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
                  throw new Error("EVM contract address not configured.");
                }

                const rawId =
                  (selectedCampaign as any).evm?.campaignId ??
                  (selectedCampaign as any).campaignId ??
                  null;
                const idStr = rawId != null ? String(rawId) : "";
                if (!/^\d+$/.test(idStr)) {
                  throw new Error(
                    "This campaign is missing a numeric on-chain ID. Please sync it with the backend before donating."
                  );
                }

                let txHashLocal = "";
                if (token === "ETH") {
                  txHashLocal = await contractDonateEth({
                    contractAddress,
                    campaignId: idStr,
                    valueEth: String(donationAmount),
                  });
                } else {
                  if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
                    throw new Error("Token address not configured.");
                  }
                  const { decimals } = await getTokenMeta(tokenAddress);
                  const parts = String(donationAmount).split(".");
                  const whole = parts[0] || "0";
                  const frac = (parts[1] || "")
                    .padEnd(decimals, "0")
                    .slice(0, decimals);
                  const raw =
                    BigInt(whole) * 10n ** BigInt(decimals) + BigInt(frac || "0");

                  await ensureAllowance(tokenAddress, from, contractAddress, raw);
                  txHashLocal = await donateErc20({
                    contractAddress,
                    campaignId: idStr,
                    tokenAddress,
                    amount: raw,
                  });
                }

                setTxHash(txHashLocal);
                setTxState("pending");

                if (backendId) {
                  try {
                    await recordCryptoDonation({
                      campaignId: String(backendId),
                      txHash: txHashLocal,
                      amountWei: "0",
                      chainId: chainIdHexToDecString(EVM_CHAIN_ID_HEX),
                      from,
                      message: donationMessage || undefined,
                    });
                  } catch {
                    // best effort only
                  }

                  const tokenStr = localStorage.getItem("auth_token");
                  const base = {
                    campaignId: String(backendId),
                    amount: amountNum,
                    paymentMethod: "crypto" as const,
                    message:
                      (donationMessage ? donationMessage + " " : "") +
                      `(tx: ${txHashLocal.slice(0, 10)}..., ${token})`,
                    isAnonymous: !userName,
                  };
                  if (tokenStr) {
                    await postAuthDonation(base as any, tokenStr);
                  } else {
                    await postGuestDonation({
                      ...base,
                      donorName: userName || undefined,
                    } as any);
                  }
                }

                setTxState("confirmed");
                toast({
                  type: "success",
                  title: "Donation sent",
                  description: `Tx: ${txHashLocal.slice(0, 10)}...`,
                });

                setTimeout(() => {
                  setShowDonationModal(false);
                  setSelectedCampaign(null);
                  setTxState("idle");
                  setTxHash("");
                  setTxError("");
                }, 1200);
              } catch (e: any) {
                setTxState("failed");
                setTxError(e?.message || "Please try again.");
                toast({
                  type: "error",
                  title: "Donation failed",
                  description: e?.message || "Please try again.",
                });
              } finally {
                setSubmitting(false);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DonationModal;

const ActionButton: React.FC<{
  submitting?: boolean;
  disabled?: boolean;
  state: DonationTxState;
  onClick: () => void | Promise<void>;
}> = ({ submitting, disabled, onClick, state }) => {
  const label =
    state === "wallet_prompt"
      ? "Awaiting Wallet Signature..."
      : state === "pending"
        ? "Waiting for Confirmation..."
        : state === "confirmed"
          ? "Donation Confirmed"
          : state === "failed"
            ? "Retry Donation"
            : submitting
              ? "Processing..."
              : "Confirm Donation";

  return (
    <button
      onClick={onClick}
      disabled={disabled || submitting || state === "pending"}
      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
    >
      {label}
    </button>
  );
};
