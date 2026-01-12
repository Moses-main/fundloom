// App.tsx

import "./App";

import React, { useState } from "react";
import { Campaign, Donation } from "./types";
import { Header } from "./components/Header";
import { CampaignCard } from "./components/CampaignCard";
import { DonationModal } from "./components/DonationModal";
import { UserProfile } from "./components/UserProfile";

// 🆕 ADD THESE for wallet management
import {
  useAccount,
  useConnect,
  useDisconnect,
  Connector,
} from "@starknet-react/core";
import { StarknetkitConnector, useStarknetkitConnectModal } from "starknetkit";

// Mock data
const initialCampaigns: Campaign[] = [
  {
    id: 1,
    charity_address: "0x123...",
    title: "Clean Water for Rural Communities",
    description:
      "Providing clean drinking water access to remote villages in Nigeria",
    target_amount: 50000,
    raised_amount: 32500,
    deadline: Date.now() + 30 * 24 * 60 * 60 * 1000,
    is_active: true,
    created_at: Date.now() - 10 * 24 * 60 * 60 * 1000,
    total_donors: 127,
  },
  // Add more mock campaigns as needed
];

const initialDonations: Donation[] = [];

const App: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [donations, setDonations] = useState<Donation[]>(initialDonations);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [donationAmount, setDonationAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  // =========================
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: connectors as StarknetkitConnector[],
  });

  const walletConnected = !!address;
  const userAddress = address || "";

  const connectWallet = async () => {
    const { connector } = await starknetkitConnectModal();
    if (!connector) return;
    await connect({ connector: connector as Connector });
  };

  const handleDonate = () => {
    if (!selectedCampaign || !donationAmount) return;

    const donation: Donation = {
      id: donations.length + 1,
      donor_address: userAddress,
      campaign_id: selectedCampaign.id,
      amount: parseFloat(donationAmount) * 1000,
      timestamp: Date.now(),
      donor_message: donationMessage,
    };

    const updatedCampaigns = campaigns.map((c) =>
      c.id === selectedCampaign.id
        ? {
            ...c,
            raised_amount: c.raised_amount + donation.amount,
            total_donors: c.total_donors + 1,
          }
        : c
    );

    setDonations([...donations, donation]);
    setCampaigns(updatedCampaigns);
    setDonationAmount("");
    setDonationMessage("");
    setSelectedCampaign(null);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletConnected={walletConnected}
        userAddress={userAddress}
        connectWallet={connectWallet}
        disconnectWallet={disconnect}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "campaigns" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                walletConnected={walletConnected}
                onDonateClick={() => {
                  setSelectedCampaign(campaign);
                  setShowModal(true);
                }}
              />
            ))}
          </div>
        )}

        {activeTab === "profile" && walletConnected && (
          <UserProfile
            donations={donations}
            campaigns={campaigns}
            userAddress={userAddress}
          />
        )}
      </main>

      {showModal && selectedCampaign && (
        <DonationModal
          selectedCampaign={selectedCampaign}
          donationAmount={donationAmount}
          setDonationAmount={setDonationAmount}
          donationMessage={donationMessage}
          setDonationMessage={setDonationMessage}
          onClose={() => setShowModal(false)}
          onConfirm={handleDonate}
        />
      )}
    </div>
  );
};

export default App;
