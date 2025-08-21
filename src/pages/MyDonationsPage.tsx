// src/pages/MyDonationsPage.tsx
import React, { useEffect, useState } from "react";
import { getMyDonations } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Gift, Inbox } from "lucide-react";

const MyDonationsPage: React.FC = () => {
  const { hasJwt } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getMyDonations({
          page: 1,
          limit: 10,
          status: "completed",
        });
        if (res?.success && (res as any).data) {
          const { donations: list, pagination } = (res as any).data as any;
          if (!cancelled) {
            setDonations(list || []);
            setPage(pagination?.currentPage || 1);
            setTotalPages(pagination?.totalPages || 1);
          }
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

  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const res = await getMyDonations({
        page: next,
        limit: 10,
        status: "completed",
      });
      if (res?.success && (res as any).data) {
        const { donations: list, pagination } = (res as any).data as any;
        setDonations((prev) => [...prev, ...(list || [])]);
        setPage(pagination?.currentPage || next);
        setTotalPages(pagination?.totalPages || totalPages);
      }
    } catch (e) {
      // Ignore, could toast if desired
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Gift className="h-6 w-6" /> My Donations
      </h1>
      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && donations.length === 0 && (
        <div className="border border-dashed border-border rounded-xl p-10 bg-muted/30 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-base font-medium">No donations yet</p>
          <p className="text-sm text-muted-foreground">
            When you donate to campaigns, they will show up here.
          </p>
        </div>
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
                  ${Number(d.amount).toLocaleString()}
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
      {!loading && donations.length > 0 && page < totalPages && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MyDonationsPage;
