// src/components/Leaderboard.tsx
import React from "react";
import { Award } from "lucide-react";

const Leaderboard: React.FC<{
  topDonors: { address: string; name: string; total: number }[];
  topCampaigns: any[];
}> = ({ topDonors, topCampaigns }) => {
  return (
    <>
      <div className="bg-card p-6 rounded-2xl shadow-lg border border-border">
        <h4 className="font-semibold text-foreground mb-4">Top Donors</h4>
        <div className="space-y-3">
          {topDonors.map((d) => (
            <div key={d.address} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Award className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {d.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{d.address}</div>
                </div>
              </div>
              <div className="text-sm font-semibold">₦{d.total}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card p-6 rounded-2xl shadow-lg border border-border">
        <h4 className="font-semibold text-foreground mb-4">Top Campaigns</h4>
        <div className="space-y-3">
          {topCampaigns.map((c) => (
            <div key={c.id} className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-foreground">
                  {c.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {c.total_donors} donors
                </div>
              </div>
              <div className="text-sm font-semibold">₦{c.raised_amount}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card p-6 rounded-2xl shadow-lg border border-border">
        <h4 className="font-semibold text-foreground mb-4">Badges</h4>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-yellow-50 border border-yellow-100 text-yellow-700 text-sm">
            Supporter
          </span>
          <span className="px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-sm">
            Generous
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm">
            Community Builder
          </span>
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
