import {
  //  Charity,
  // Donation,
  Campaign,
} from "../../types/index";
import {
  //  useEffect,
  useState,
} from "react";
import // formatAddress,
// formatDate,
// formatEth,
// formatProgress,
// formatTimeAgo,
"@/utils/formatEther";

import { getProgressPercentage } from "../../hooks/ConnectWallet";

import {
  formatAmount,
  // formatDate
} from "@/utils/formatters";
export const DonationModal: React.FC<{
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onDonate: (amount: number, message: string) => void;
}> = ({ campaign, isOpen, onClose, onDonate }) => {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !campaign) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onDonate(parseFloat(amount), message);
      setAmount("");
      setMessage("");
      setIsSubmitting(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Make a Donation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">{campaign.title}</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Target: ${formatAmount(campaign.target_amount)}</span>
              <span>Raised: ${formatAmount(campaign.raised_amount)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${getProgressPercentage(
                    campaign.raised_amount,
                    campaign.target_amount
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Donation Amount ($)
            </label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.1"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a message of support..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !amount}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Processing..." : "Donate Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
