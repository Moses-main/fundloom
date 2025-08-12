// src/components/DonorList.tsx
import React from "react";
import { useAppContext } from "../context/AppContext";
import { DollarSign } from "lucide-react";

const DonorList: React.FC = () => {
  const { donations, selectedCampaign, formatAmount } = useAppContext();
  if (!selectedCampaign) return null;

  const donors = donations
    .filter((d) => d.campaign_id === selectedCampaign.id)
    .slice()
    .reverse();

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h4 className="font-semibold text-gray-900 mb-4">Recent Donors</h4>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {donors.map((d) => (
          <div key={d.id} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">
                {d.donor_name || d.donor_address}
              </div>
              <div className="text-xs text-gray-500">{d.donor_message}</div>
            </div>
            <div className="text-sm font-semibold">
              ₦{formatAmount(d.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonorList;
