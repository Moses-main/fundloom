// src/components/CampaignStats.tsx
import React from "react";
import { TrendingUp, Target, Users, Heart } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const CampaignStats: React.FC = () => {
  const { campaigns, donations, formatAmount } = useAppContext();
  const totalRaised = campaigns.reduce((s, c) => s + c.raised_amount, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Raised</p>
            <p className="text-3xl font-bold text-gray-900">
              ₦{formatAmount(totalRaised)}
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-500" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Active Campaigns
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {campaigns.length}
            </p>
          </div>
          <Target className="h-8 w-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Donors</p>
            <p className="text-3xl font-bold text-gray-900">
              {donations.length}
            </p>
          </div>
          <Users className="h-8 w-8 text-purple-500" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Impact Score</p>
            <p className="text-3xl font-bold text-gray-900">98%</p>
          </div>
          <Heart className="h-8 w-8 text-red-500" />
        </div>
      </div>
    </div>
  );
};

export default CampaignStats;
