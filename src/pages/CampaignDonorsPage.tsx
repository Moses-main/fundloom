// src/pages/CampaignDonorsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCampaignDetails, getCampaignDonations } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Users, Inbox } from "lucide-react";

const CampaignDonorsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasJwt } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<any | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isOwner = useMemo(() => {
    const creatorId =
      (campaign as any)?.creator?._id || (campaign as any)?.creatorId;
    return !!user?.id && !!creatorId && String(creatorId) === String(user.id);
  }, [campaign, user?.id]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        // 1) Get campaign and verify ownership
        const details = await getCampaignDetails(id);
        const c = (details as any)?.data?.campaign;
        if (!c) throw new Error("Campaign not found");
        if (!cancelled) setCampaign(c);

        const creatorId = c?.creator?._id || c?.creatorId;
        if (!(user?.id && creatorId && String(creatorId) === String(user.id))) {
          throw new Error(
            "You are not authorized to view donors of this campaign"
          );
        }

        // 2) Load first donors page
        const res = await getCampaignDonations(id, 1, 20);
        const { donations: list, pagination } = (res as any).data || {};
        if (!cancelled) {
          setDonations(list || []);
          setPage(pagination?.currentPage || 1);
          setTotalPages(pagination?.totalPages || 1);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load donors");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (hasJwt) run();
    return () => {
      cancelled = true;
    };
  }, [id, hasJwt, user?.id]);

  const loadMore = async () => {
    if (!id || loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const res = await getCampaignDonations(id, next, 20);
      const { donations: list, pagination } = (res as any).data || {};
      setDonations((prev) => [...prev, ...(list || [])]);
      setPage(pagination?.currentPage || next);
      setTotalPages(pagination?.totalPages || totalPages);
    } catch {
    } finally {
      setLoadingMore(false);
    }
  };

  // If unauthorized, show a simple message with back link
  if (!loading && error && /not authorized/i.test(error)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-xl font-semibold mb-2">Access denied</h1>
        <p className="text-muted-foreground">
          Only the campaign creator can view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <Users className="h-6 w-6" /> Campaign Donors
      </h1>
      {campaign && (
        <p className="text-muted-foreground mb-6">{campaign.title}</p>
      )}

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && !/not authorized/i.test(error) && (
        <p className="text-red-600">{error}</p>
      )}

      {!loading && isOwner && donations.length === 0 && (
        <div className="border border-dashed border-border rounded-xl p-10 bg-muted/30 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-base font-medium">No donors yet</p>
          <p className="text-sm text-muted-foreground">
            Once your campaign receives donations, they will appear here.
          </p>
        </div>
      )}

      {isOwner && donations.length > 0 && (
        <div className="space-y-4">
          {donations.map((d: any) => (
            <div
              key={d._id}
              className="border border-border rounded-lg p-4 bg-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {d.isAnonymous
                      ? "Anonymous"
                      : d.donor?.name || d.donorName || "Donor"}
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
      )}

      {!loading && isOwner && page < totalPages && (
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

export default CampaignDonorsPage;
