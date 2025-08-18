// src/pages/MyCampaignsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { getUserDashboard } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import CampaignCard from "@/components/CampaignCard";
import { useAppContext } from "@/context/AppContext";

const MyCampaignsPage: React.FC = () => {
  const { hasJwt } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myCampaigns, setMyCampaigns] = useState<any[]>([]);
  const { setShowCreateModal } = useAppContext();

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getUserDashboard();
        if (res?.success && (res as any).data) {
          const { campaigns } = (res as any).data as any;
          if (!cancelled) setMyCampaigns(campaigns || []);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load your campaigns");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (hasJwt) run();
    return () => {
      cancelled = true;
    };
  }, [hasJwt]);

  const mapped = useMemo(() => {
    return (myCampaigns || []).map((bc: any, idx: number) => ({
      id: Date.now() + idx,
      charity_address: bc.charityAddress || bc.creator?.walletAddress || "0x0",
      title: bc.title,
      description: bc.description,
      target_amount: bc.targetAmount,
      raised_amount: bc.raisedAmount ?? 0,
      deadline: new Date(bc.deadline).getTime(),
      is_active: bc.isActive ?? true,
      created_at: new Date(bc.createdAt).getTime(),
      total_donors: bc.totalDonors ?? 0,
      image: bc.image || null,
      category: bc.category,
      template: bc.template || "default",
      funds_used: bc.fundsUsed
        ? Object.fromEntries(Object.entries(bc.fundsUsed))
        : {},
      // @ts-ignore
      backendId: bc._id,
      // @ts-ignore
      creatorId: bc.creator?._id || null,
    }));
  }, [myCampaigns]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Campaigns</h1>
        <Button
          className="cursor-pointer"
          onClick={() => setShowCreateModal(true)}
        >
          New Campaign
        </Button>
      </div>
      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && mapped.length === 0 && (
        <p className="text-muted-foreground">
          You have not created any campaigns yet.
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mapped.map((c) => (
          <CampaignCard
            key={(c as any).backendId || c.id}
            campaign={c as any}
          />
        ))}
      </div>
    </div>
  );
};

export default MyCampaignsPage;
