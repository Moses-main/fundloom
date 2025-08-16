// src/components/DonorList.tsx
import React from "react";
import { useAppContext } from "../context/AppContext";
import { DollarSign } from "lucide-react";

const SkeletonRow = () => (
  <div className="flex items-center justify-between animate-pulse">
    <div>
      <div className="h-3 w-28 bg-gray-200 rounded" />
      <div className="h-3 w-40 bg-gray-200 rounded mt-2" />
    </div>
    <div className="h-4 w-16 bg-gray-200 rounded" />
  </div>
);

const DonorList: React.FC = () => {
  const ctx = useAppContext() as any;
  const {
    donations,
    selectedCampaign,
    formatAmount,
    backendRecentDonations,
    detailsLoading,
    detailsError,
  } = ctx;
  if (!selectedCampaign) return null;

  const isBackend = !!selectedCampaign.backendId;

  const donors = donations
    .filter((d: any) => d.campaign_id === selectedCampaign.id)
    .slice()
    .reverse();

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h4 className="font-semibold text-gray-900 mb-4">Recent Donors</h4>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {isBackend ? (
          detailsLoading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : detailsError ? (
            <div className="text-sm text-red-600">{detailsError}</div>
          ) : backendRecentDonations && backendRecentDonations.length > 0 ? (
            backendRecentDonations.map((d: any) => (
              <div key={d._id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    {d.isAnonymous
                      ? "Anonymous"
                      : d.donorName || d.donor?.name || "Donor"}
                  </div>
                  {d.message && (
                    <div className="text-xs text-gray-500">{d.message}</div>
                  )}
                </div>
                <div className="text-sm font-semibold">
                  ₦{formatAmount(d.amount)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">
              No donations yet. Be the first!
            </div>
          )
        ) : (
          donors.map((d: any) => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default DonorList;
