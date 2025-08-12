// src/shell/Shell.tsx
import React from "react";
import { useAppContext } from "../context/AppContext";
import { Header } from "../components/Header";
import CampaignsPage from "../pages/CampaignsPage";
import DonatePage from "../pages/DonatePage";
import ProfilePage from "../pages/ProfilePage";
import DonationModal from "../components/DonationModal";
import ThankYouModal from "../components/ThankYouModal";
import CreateCampaignModal from "../components/CreateCampaignModal";

const Shell: React.FC = () => {
  const {
    activeTab,
    showDonationModal,
    showThankYou,
    showCreateModal,
    selectedCampaign,
  } = useAppContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "campaigns" && <CampaignsPage />}
        {activeTab === "donate" && selectedCampaign && <DonatePage />}
        {activeTab === "profile" && <ProfilePage />}
      </main>

      {showDonationModal && selectedCampaign && <DonationModal />}
      {showThankYou && <ThankYouModal />}
      {showCreateModal && <CreateCampaignModal />}
    </div>
  );
};

export default Shell;
