// src/pages/CampaignsPage.tsx
import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import CampaignStats from "../components/CampaignStats";
import SearchFilterBar from "../components/SearchFilterBar";
import CampaignList from "../components/CampaignList";
import Leaderboard from "../components/Leaderboard";

const CampaignsPage: React.FC = () => {
  const { campaigns, donations, leaderboard } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const categories = [
    "All",
    ...Array.from(new Set(campaigns.map((c) => c.category || "Uncategorized"))),
  ];
  // filtered campaigns passed to CampaignList
  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <CampaignStats />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
        <SearchFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categories={categories}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CampaignList campaigns={filteredCampaigns} />
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Leaderboard
          topDonors={leaderboard.slice(0, 5)}
          topCampaigns={campaigns
            .slice()
            .sort((a, b) => b.raised_amount - a.raised_amount)
            .slice(0, 5)}
        />
      </div>
    </div>
  );
};

export default CampaignsPage;
