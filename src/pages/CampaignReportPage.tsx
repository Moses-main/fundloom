// src/pages/CampaignReportPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCampaignDetails,
  getCampaignDonations,
  getCampaignUpdates,
  createCampaignUpdate,
  patchCampaignLifecycle,
} from "@/lib/api";
import { ArrowLeft, FileText, Inbox, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";
import {
  deriveCampaignLifecycleStatus,
  lifecycleLabel,
} from "@/lib/campaignLifecycle";

const CampaignReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { show: toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<any | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [updatingLifecycle, setUpdatingLifecycle] = useState(false);
  const [updateDraft, setUpdateDraft] = useState({ title: "", content: "" });

  const progressPct = useMemo(() => {
    const target = Number(campaign?.target_amount || campaign?.targetAmount || 0);
    const raised = Number(campaign?.raised_amount || campaign?.raisedAmount || 0);
    if (!target) return 0;
    return Math.min(100, Math.round((raised / target) * 100));
  }, [campaign?.raised_amount, campaign?.target_amount, campaign?.raisedAmount, campaign?.targetAmount]);

  const userId = (user as any)?.id || (user as any)?._id;
  const creatorId = campaign?.creator?._id || campaign?.creatorId || campaign?.ownerId || null;
  const isOwner = !!userId && !!creatorId && String(userId) === String(creatorId);
  const isAdmin = String((user as any)?.role || "").toLowerCase() === "admin";
  const canManageCampaign = isOwner || isAdmin;

  const lifecycle = useMemo(() => {
    if (!campaign) return "active";
    return deriveCampaignLifecycleStatus({
      status: campaign.lifecycleStatus || campaign.status,
      isActive: campaign.isActive,
      isArchived: campaign.isArchived,
      isFlagged: campaign.isFlagged,
      isVerified: campaign?.verification?.isVerified,
      raisedAmount: campaign.raisedAmount,
      targetAmount: campaign.targetAmount,
      deadline: campaign.deadline,
    });
  }, [campaign]);

  const loadPageData = async (campaignId: string) => {
    const details = await getCampaignDetails(campaignId);
    const c = (details as any)?.data?.campaign;
    if (!c) throw new Error("Campaign not found");
    setCampaign(c);

    const donationsRes = await getCampaignDonations(campaignId, 1, 20);
    const { donations: list } = (donationsRes as any).data || {};
    setDonations(list || []);

    try {
      const updatesRes = await getCampaignUpdates(campaignId, 1, 20);
      const { updates: updateList } = (updatesRes as any).data || {};
      setUpdates(updateList || []);
    } catch {
      setUpdates([]);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        await loadPageData(id);
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

  const submitUpdate = async () => {
    if (!id || !token || !canManageCampaign) return;
    const title = updateDraft.title.trim();
    const content = updateDraft.content.trim();
    if (!title || !content) return;

    setPostingUpdate(true);
    try {
      await createCampaignUpdate(id, { title, content }, token);
      setUpdateDraft({ title: "", content: "" });
      const updatesRes = await getCampaignUpdates(id, 1, 20);
      const { updates: updateList } = (updatesRes as any).data || {};
      setUpdates(updateList || []);
      toast({
        type: "success",
        title: "Update posted",
        description: "Campaign timeline has been updated.",
      });
    } catch (e: any) {
      toast({
        type: "error",
        title: "Failed to post update",
        description: e?.message || "Please try again.",
      });
    } finally {
      setPostingUpdate(false);
    }
  };

  const runLifecycleAction = async (
    action: "pause" | "activate" | "archive",
    reason: string
  ) => {
    if (!id || !token || !canManageCampaign) return;
    setUpdatingLifecycle(true);
    try {
      const payload =
        action === "pause"
          ? { isActive: false, lifecycleStatus: "paused", moderationReason: reason }
          : action === "activate"
            ? { isActive: true, isArchived: false, lifecycleStatus: "active", moderationReason: reason }
            : { isArchived: true, isActive: false, lifecycleStatus: "archived", moderationReason: reason };

      await patchCampaignLifecycle(id, payload, token);
      await loadPageData(id);
      toast({
        type: "success",
        title: "Campaign updated",
        description: `Lifecycle changed to ${action}.`,
      });
    } catch (e: any) {
      toast({
        type: "error",
        title: "Lifecycle update failed",
        description: e?.message || "Please try again.",
      });
    } finally {
      setUpdatingLifecycle(false);
    }
  };

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
        <p className="text-muted-foreground mb-6">
          {campaign.title} · <span className="font-medium">{lifecycleLabel(lifecycle)}</span>
        </p>
      )}

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && campaign && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-border rounded-xl p-4 bg-card">
              <div className="text-sm text-muted-foreground">Total Raised</div>
              <div className="mt-1 text-xl font-semibold">
                ${Number(campaign.raised_amount || campaign.raisedAmount || 0).toLocaleString()}
              </div>
            </div>
            <div className="border border-border rounded-xl p-4 bg-card">
              <div className="text-sm text-muted-foreground">Target</div>
              <div className="mt-1 text-xl font-semibold">
                ${Number(campaign.target_amount || campaign.targetAmount || 0).toLocaleString()}
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
              <div className="mt-1 text-sm text-muted-foreground">{progressPct}%</div>
            </div>
          </div>

          {canManageCampaign && (
            <div className="border border-border rounded-xl p-4 bg-card space-y-3">
              <h2 className="text-lg font-semibold">Lifecycle Controls</h2>
              <p className="text-sm text-muted-foreground">
                Owners/admins can pause, reactivate, or archive campaigns for moderation and maintenance.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={updatingLifecycle || lifecycle === "paused" || lifecycle === "archived"}
                  onClick={() => runLifecycleAction("pause", "Paused by campaign manager")}
                  className="px-3 py-2 rounded-lg border border-border bg-muted disabled:opacity-60"
                >
                  Pause campaign
                </button>
                <button
                  disabled={updatingLifecycle || lifecycle === "active"}
                  onClick={() => runLifecycleAction("activate", "Reactivated by campaign manager")}
                  className="px-3 py-2 rounded-lg border border-border bg-muted disabled:opacity-60"
                >
                  Reactivate campaign
                </button>
                <button
                  disabled={updatingLifecycle || lifecycle === "archived"}
                  onClick={() => runLifecycleAction("archive", "Archived by campaign manager")}
                  className="px-3 py-2 rounded-lg border border-red-200 text-red-700 bg-red-50 disabled:opacity-60"
                >
                  Archive campaign
                </button>
              </div>
            </div>
          )}

          <div className="border border-border rounded-xl p-4 bg-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Campaign Updates Timeline</h2>
              <span className="text-sm text-muted-foreground">{updates.length} updates</span>
            </div>

            {canManageCampaign && (
              <div className="space-y-2 border border-dashed border-border rounded-lg p-3 bg-muted/20">
                <input
                  value={updateDraft.title}
                  onChange={(e) => setUpdateDraft((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Update title"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
                <textarea
                  value={updateDraft.content}
                  onChange={(e) => setUpdateDraft((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Share milestone progress, fund usage, or next steps..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
                <div className="flex justify-end">
                  <button
                    onClick={submitUpdate}
                    disabled={postingUpdate || !updateDraft.title.trim() || !updateDraft.content.trim()}
                    className="px-3 py-2 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white disabled:opacity-60"
                  >
                    {postingUpdate ? "Posting..." : "Post update"}
                  </button>
                </div>
              </div>
            )}

            {updates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No campaign updates published yet.</p>
            ) : (
              <div className="space-y-3">
                {updates.map((u: any) => (
                  <div key={u._id || u.id} className="border border-border rounded-lg p-3 bg-background">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-medium">{u.title || "Campaign update"}</h3>
                      <span className="text-xs text-muted-foreground">
                        {u.createdAt ? new Date(u.createdAt).toLocaleString() : "—"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{u.content || u.message || ""}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      By {u.authorName || u.author?.name || "Campaign team"}
                      {u.moderationStatus ? ` · ${u.moderationStatus}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
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
