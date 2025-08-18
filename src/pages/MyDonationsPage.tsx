// src/pages/MyDonationsPage.tsx
import React, { useEffect, useState } from "react";
import { getUserDashboard } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const MyDonationsPage: React.FC = () => {
  const { hasJwt } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donations, setDonations] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getUserDashboard();
        if (res?.success && (res as any).data) {
          const { recentDonationsMade } = (res as any).data as any;
          if (!cancelled) setDonations(recentDonationsMade || []);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load your donations");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (hasJwt) run();
    return () => {
      cancelled = true;
    };
  }, [hasJwt]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Donations</h1>
      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && donations.length === 0 && (
        <p className="text-muted-foreground">
          You haven't made any donations yet.
        </p>
      )}
      <div className="space-y-4">
        {donations.map((d: any) => (
          <div
            key={d._id}
            className="border border-border rounded-lg p-4 bg-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {d.campaign?.title || "Campaign"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(d.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  ₦{Number(d.amount).toLocaleString()}
                </div>
                {d.message && (
                  <div className="text-sm text-muted-foreground max-w-md truncate">
                    "{d.message}"
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyDonationsPage;
