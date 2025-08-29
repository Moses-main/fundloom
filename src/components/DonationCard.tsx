// src/components/DonationCard.tsx
import { Button } from "./ui/Button";
import { Progress } from "./ui/Progress";
import { Heart, Share2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./ui/ToastProvider";

interface DonationCardProps {
  campaign: {
    id: string | number;
    title: string;
    raised_amount: number;
    target_amount: number;
    deadline: number;
    is_active: boolean;
  };
}

export function DonationCard({ campaign }: DonationCardProps) {
  const [donationAmount, setDonationAmount] = useState("");
  const [isDonating, setIsDonating] = useState(false);
  const { isAuthenticated } = useAuth();
  const { show: showToast } = useToast();
  const progress = Math.min(
    (campaign.raised_amount / campaign.target_amount) * 100,
    100
  );
  const daysLeft = Math.max(
    0,
    Math.ceil((campaign.deadline * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      // Handle login redirect
      return;
    }
    if (!donationAmount) return;

    setIsDonating(true);
    try {
      // Handle donation logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showToast({
        title: "Thank you!",
        description: `Your donation of $${donationAmount} has been received.`,
        type: "success",
      });
      setDonationAmount("");
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to process donation. Please try again.",
        type: "error",
      });
    } finally {
      setIsDonating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Make a Donation</h3>
        <button className="text-gray-500 hover:text-gray-700">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Raised: ${campaign.raised_amount.toLocaleString()}
          </span>
          <span className="text-gray-600">
            Goal: ${campaign.target_amount.toLocaleString()}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{progress.toFixed(1)}% funded</span>
          <span>{daysLeft} days left</span>
        </div>
      </div>

      <form onSubmit={handleDonate} className="space-y-3">
        <div>
          <input
            type="number"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Enter amount ($)"
            min="1"
            step="1"
            disabled={isDonating}
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700"
          disabled={isDonating || !donationAmount}
        >
          {isDonating ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Heart className="w-4 h-4 mr-2" />
              {isAuthenticated ? "Donate Now" : "Sign In to Donate"}
            </span>
          )}
        </Button>
      </form>

      {!isAuthenticated && (
        <p className="text-xs text-center text-gray-500">
          You'll need to sign in to make a donation
        </p>
      )}
    </div>
  );
}
