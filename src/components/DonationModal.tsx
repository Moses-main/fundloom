// // components/DonationModal.tsx

// import React from "react";
// import { Campaign } from "../types";
// import { formatAmount, getProgressPercentage } from "../utils/formatters";

// interface Props {
//   selectedCampaign: Campaign;
//   donationAmount: string;
//   setDonationAmount: (val: string) => void;
//   donationMessage: string;
//   setDonationMessage: (val: string) => void;
//   onClose: () => void;
//   onConfirm: () => void;
// }

// export const DonationModal: React.FC<Props> = ({
//   selectedCampaign,
//   donationAmount,
//   setDonationAmount,
//   donationMessage,
//   setDonationMessage,
//   onClose,
//   onConfirm,
// }) => {
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-bold text-gray-900">Make a Donation</h3>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 text-xl"
//           >
//             ×
//           </button>
//         </div>

//         <div className="mb-6">
//           <h4 className="font-semibold text-gray-900 mb-2">
//             {selectedCampaign.title}
//           </h4>
//           <div className="w-full bg-gray-200 rounded-full h-2">
//             <div
//               className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
//               style={{
//                 width: `${getProgressPercentage(
//                   selectedCampaign.raised_amount,
//                   selectedCampaign.target_amount
//                 )}%`,
//               }}
//             ></div>
//           </div>
//           <p className="text-sm text-gray-600 mt-2">
//             {formatAmount(selectedCampaign.raised_amount)} of{" "}
//             {formatAmount(selectedCampaign.target_amount)} raised
//           </p>
//         </div>

//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Donation Amount (₦)
//             </label>
//             <input
//               type="number"
//               value={donationAmount}
//               onChange={(e) => setDonationAmount(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Enter amount"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Message (Optional)
//             </label>
//             <textarea
//               value={donationMessage}
//               onChange={(e) => setDonationMessage(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               rows={3}
//               placeholder="Leave a message of support..."
//             />
//           </div>

//           <button
//             onClick={onConfirm}
//             disabled={!donationAmount}
//             className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
//           >
//             Confirm Donation
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// src/components/DonationModal.tsx
import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Wallet,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

const PaymentMethodSelector: React.FC = () => {
  const { selectedPayment, setSelectedPayment } = useAppContext();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => setSelectedPayment("crypto")}
        className={`px-3 py-2 rounded-xl border min-w-[110px] ${
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
        className={`px-3 py-2 rounded-xl border min-w-[110px] ${
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
        className={`px-3 py-2 rounded-xl border min-w-[110px] ${
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
        className={`px-3 py-2 rounded-xl border min-w-[110px] ${
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
    handleDonate,
    walletConnected,
    userName,
    setUserName,
  } = useAppContext();

  const [donorEmail, setDonorEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const backendId = (selectedCampaign as any)?.backendId || (selectedCampaign as any)?._id;
  const { show: toast } = useToast();

  if (!selectedCampaign) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Make a Donation</h3>
          <button
            onClick={() => {
              setShowDonationModal(false);
              setSelectedCampaign(null);
              if (window.history && window.history.replaceState) {
                const cleanUrl =
                  window.location.origin + window.location.pathname;
                window.history.replaceState({}, "", cleanUrl);
              }
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">
            {selectedCampaign.title}
          </h4>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              style={{
                width: `${getProgressPercentage(
                  selectedCampaign.raised_amount,
                  selectedCampaign.target_amount
                )}%`,
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            ₦{formatAmount(selectedCampaign.raised_amount)} of ₦
            {formatAmount(selectedCampaign.target_amount)} raised
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your name (optional)
            </label>
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              placeholder="How should we address you?"
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
                  This campaign isn\'t synced with the server yet. Please create/select a server-backed campaign to use card payments.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedPayment === "crypto" ? "Donation Amount (ETH)" : "Donation Amount (₦)"}
            </label>
            <input
              type="number"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              placeholder={selectedPayment === "crypto" ? "e.g. 0.01" : "Enter amount"}
            />
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
              Crypto uses your browser wallet (MetaMask or compatible). Card/bank/mobile are simulated for demo purposes.
            </p>
          </div>

          <ActionButton
            submitting={submitting}
            disabled={!donationAmount || (selectedPayment === "card" && (!donorEmail || !backendId))}
            onClick={async () => {
              const amountNum = parseFloat(donationAmount || "0");
              if (!selectedCampaign || !amountNum || amountNum <= 0) return;
              if (selectedPayment === "card") {
                // Initialize Paystack and redirect
                try {
                  setSubmitting(true);
                  if (!backendId) {
                    setSubmitting(false);
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
                    // Optionally set a callback URL; leaving undefined relies on webhook-only confirmation
                  });
                  if (resp?.success && (resp.data as any)?.authorizationUrl) {
                    window.location.href = (resp.data as any).authorizationUrl;
                  } else {
                    throw new Error(resp?.message || "Failed to initialize Paystack");
                  }
                } catch (e: any) {
                  toast({ type: "error", title: "Payment init failed", description: e?.message || "Failed to start card payment." });
                } finally {
                  setSubmitting(false);
                }
              } else {
                // Existing demo/backend flow
                handleDonate(true);
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
  onClick: () => void | Promise<void>;
}> = ({ submitting, disabled, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || submitting}
      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
    >
      {submitting ? "Redirecting..." : "Confirm Donation"}
    </button>
  );
};
