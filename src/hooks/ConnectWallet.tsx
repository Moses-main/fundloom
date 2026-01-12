// NEVER DELETE OR COMMENT OUT

import React, {
  useState,
  //  useEffect
} from "react";
import {
  // Heart,
  // Users,
  // Target,
  // Calendar,
  Wallet,
  // Plus,
  // Eye,
  // ArrowRight,
  // CheckCircle,
  // Clock,
  // DollarSign,
} from "lucide-react";

// Types
export interface Charity {
  name: string;
  description: string;
  wallet_address: string;
  is_verified: boolean;
  total_raised: number;
  campaigns_count: number;
  registration_date: number;
}

export interface Campaign {
  id: number;
  charity_address: string;
  title: string;
  description: string;
  target_amount: number;
  raised_amount: number;
  deadline: number;
  is_active: boolean;
  created_at: number;
  total_donors: number;
}

export interface Donation {
  id: number;
  donor_address: string;
  campaign_id: number;
  amount: number;
  timestamp: number;
  donor_message: string;
}

export const mockDonations: Donation[] = [
  {
    id: 1,
    donor_address: "0xabc...123",
    campaign_id: 1,
    amount: 500,
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    donor_message: "Hope this helps!",
  },
  {
    id: 2,
    donor_address: "0xdef...456",
    campaign_id: 1,
    amount: 250,
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    donor_message: "Great cause!",
  },
];

// Utility Functions
export const formatEther = (wei: number): string => {
  return (wei / 1000000000000000000).toFixed(4);
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString();
};

export const getDaysRemaining = (deadline: number): number => {
  const now = Date.now();
  const diff = deadline - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const getProgressPercentage = (
  raised: number,
  target: number
): number => {
  return Math.min(100, (raised / target) * 100);
};

// Components
export const ConnectWallet: React.FC<{
  onConnect: (address: string) => void;
}> = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    // Simulate wallet connection
    setTimeout(() => {
      onConnect("0x1234...5678");
      setIsConnecting(false);
    }, 1500);
  };

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium disabled:opacity-50"
    >
      <Wallet size={20} />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
};
