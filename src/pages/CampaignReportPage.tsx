// src/pages/CampaignReportPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCampaignDetails, getCampaignDonations } from "@/lib/api";
import { ArrowLeft, FileText, Inbox, TrendingUp } from "lucide-react";

const CampaignReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<any | null>(null);
  const [donations, setDonations] = useState<any[]>([]);

  const progressPct = useMemo(() => {
    const target = Number(campaign?.target_amount || 0);
    const raised = Number(campaign?.raised_amount || 0);
    if (!target) return 0;
    return Math.min(100, Math.round((raised / target) * 100));
  }, [campaign?.raised_amount, campaign?.target_amount]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const details = await getCampaignDetails(id);
        const c = (details as any)?.data?.campaign;
        if (!c) throw new Error("Campaign not found");
        if (!cancelled) setCampaign(c);

        const res = await getCampaignDonations(id, 1, 20);
        const { donations: list } = (res as any).data || {};
        if (!cancelled) setDonations(list || []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load report");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Campaign Report</h1>
      </div>
      {campaign && (
        <p className="text-muted-foreground mb-6">{campaign.title}</p>
      )}

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && campaign && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-border rounded-xl p-4 bg-card">
              <div className="text-sm text-muted-foreground">Total Raised</div>
              <div className="mt-1 text-xl font-semibold">
                ${Number(campaign.raised_amount || 0).toLocaleString()}
              </div>
            </div>
            <div className="border border-border rounded-xl p-4 bg-card">
              <div className="text-sm text-muted-foreground">Target</div>
              <div className="mt-1 text-xl font-semibold">
                ${Number(campaign.target_amount || 0).toLocaleString()}
              </div>
            </div>
            <div className="border border-border rounded-xl p-4 bg-card">
              <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
                Progress <TrendingUp className="h-4 w-4" />
              </div>
              <div className="mt-2 w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {progressPct}%
              </div>
            </div>
          </div>

          {donations.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-10 bg-muted/30 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-base font-medium">No donations yet</p>
              <p className="text-sm text-muted-foreground">
                There is no report available because this campaign has not
                received any donations yet.
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold mb-3">Recent Donations</h2>
              <div className="space-y-3">
                {donations.slice(0, 10).map((d: any) => (
                  <div
                    key={d._id}
                    className="border border-border rounded-lg p-4 bg-card"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {new Date(d.createdAt).toLocaleString()}
                      </div>
                      <div className="font-semibold">
                        ${Number(d.amount).toLocaleString()}
                      </div>
                    </div>
                    {d.message && (
                      <div className="text-sm text-muted-foreground mt-1">
                        "{d.message}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CampaignReportPage;
