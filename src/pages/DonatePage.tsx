// src/pages/DonatePage.tsx
import React from "react";
import { useAppContext } from "../context/AppContext";
import CampaignDetail from "../components/CampaignDetail";
import DiscussionBoard from "../components/DiscussionBoard";
import DonorList from "../components/DonorList";

const DonatePage: React.FC = () => {
  const { selectedCampaign } = useAppContext();
  if (!selectedCampaign)
    return <div>No campaign selected. Pick one from campaigns tab.</div>;

  return (
    <div className="space-y-6">
      <CampaignDetail />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <DiscussionBoard />
        </div>
        <div>
          <DonorList />
        </div>
      </div>
    </div>
  );
};

export default DonatePage;
