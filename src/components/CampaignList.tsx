// src/components/CampaignList.tsx
import React from "react";
import { Campaign } from "../context/AppContext";
import CampaignCard from "./CampaignCard";

const CampaignList: React.FC<{ campaigns: Campaign[] }> = ({ campaigns }) => {
  return (
    <>
      {/* Create card (first) is shown inside CampaignList */}
      <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="h-48 bg-muted/50 relative flex items-center justify-center">
          <div className="text-center p-6 flex flex-col items-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-foreground mt-4">
              Start a Campaign
            </h3>
            <p className="text-muted-foreground text-sm mt-2">
              Create a new campaign and share it with your community.
            </p>
            <div className="mt-4">
              {/* the create button is shown here in small screens via SearchFilterBar's button is hidden on small screens, you can open modal elsewhere */}
            </div>
          </div>
        </div>
      </div>

      {campaigns.map((c) => (
        <CampaignCard key={c.id} campaign={c} />
      ))}
    </>
  );
};

export default CampaignList;
