// src/shell/Shell.tsx
import React from "react";
import { useAppContext } from "../context/AppContext";
import CampaignsPage from "../pages/CampaignsPage";
import ProfilePage from "../pages/ProfilePage";
import DonationModal from "../components/DonationModal";
import ThankYouModal from "../components/ThankYouModal";
import CreateCampaignModal from "../components/CreateCampaignModal";
import MyDonationsPage from "@/pages/MyDonationsPage";
import MyCampaignsPage from "@/pages/MyCampaignsPage";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";

const Shell: React.FC = () => {
  const {
    activeTab,
    showDonationModal,
    showThankYou,
    showCreateModal,
    selectedCampaign,
  } = useAppContext();
  const { hasJwt, user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && <CampaignsPage />}
        {activeTab === "donated" && <MyDonationsPage />}
        {activeTab === "profile" && <ProfilePage />}
        {activeTab === "campaigns" && (
          user?.id ? (
            <MyCampaignsPage />
          ) : hasJwt && !user?.id ? (
            <p className="text-muted-foreground">Loading your account…</p>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Please sign in to view campaigns you've created.
              </p>
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          )
        )}
      </main>

      {showDonationModal && selectedCampaign && <DonationModal />}
      {showThankYou && <ThankYouModal />}
      {showCreateModal && <CreateCampaignModal />}
    </div>
  );
};

export default Shell;
