// src/components/CampaignDetail.tsx
import React from "react";
import { useAppContext } from "../context/AppContext";

const CampaignDetail: React.FC = () => {
  const {
    selectedCampaign,
    formatAmount,
    formatDate,
    getProgressPercentage,
    setShowDonationModal,
    copyShareLink,
    buildSocialLinks,
    setActiveTab,
  } = useAppContext();
  if (!selectedCampaign) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex flex-col lg:flex-row items-start gap-6">
        <div className="w-full lg:w-1/3">
          {selectedCampaign.image ? (
            <img
              src={selectedCampaign.image}
              alt={selectedCampaign.title}
              className="rounded-xl w-full h-56 sm:h-64 object-cover"
            />
          ) : (
            <div className="h-56 sm:h-64 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 w-full" />
          )}
        </div>

        <div className="flex-1 w-full">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCampaign.title}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {selectedCampaign.description}
          </p>

          <div className="mt-4">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span>{selectedCampaign.total_donors} donors</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>{formatDate(selectedCampaign.created_at)}</span>
              </div>
            </div>

            <div className="mt-4 w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                style={{
                  width: `${getProgressPercentage(
                    selectedCampaign.raised_amount,
                    selectedCampaign.target_amount
                  )}%`,
                }}
              ></div>
            </div>

            <div className="mt-3 text-sm text-gray-700">
              <strong>Raised:</strong> ₦
              {formatAmount(selectedCampaign.raised_amount)} / ₦
              {formatAmount(selectedCampaign.target_amount)}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
              <button
                onClick={() => {
                  setShowDonationModal(true);
                  setActiveTab("campaigns");
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl w-full sm:w-auto"
              >
                Donate
              </button>
              <button
                onClick={() => copyShareLink(selectedCampaign.id)}
                className="bg-white border border-gray-200 px-4 py-2 rounded-xl w-full sm:w-auto"
              >
                Share
              </button>
              <a
                href={buildSocialLinks(selectedCampaign).twitter}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-500 text-center sm:text-left"
              >
                Tweet
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Transparency */}
      <div className="mt-6 border-t pt-4">
        <h4 className="font-semibold text-gray-900">Transparency Report</h4>
        <p className="text-sm text-gray-600 mt-2">
          A short breakdown of how funds are being used (demo data)
        </p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {selectedCampaign.funds_used &&
          Object.entries(selectedCampaign.funds_used).length > 0 ? (
            Object.entries(selectedCampaign.funds_used).map(([k, v]) => (
              <div
                key={k}
                className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm"
              >
                <div className="text-gray-600">{k}</div>
                <div className="mt-1 font-semibold">₦{v}</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">
              No detailed expenses recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
