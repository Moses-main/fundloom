import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Inbox, Flag } from "lucide-react";
import {
  getCampaignDetails,
  getCampaignComments,
  createComment,
  reportCampaignComment,
  reportCampaign,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";

const PAGE_SIZE = 20;
const MAX_COMMENT_CHARS = 600;
const MIN_SECONDS_BETWEEN_COMMENTS = 12;
const SPAM_LINK_LIMIT = 2;

const hasLikelySpam = (text: string) => {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return false;
  const urlMatches = normalized.match(/https?:\/\//g)?.length || 0;
  if (urlMatches > SPAM_LINK_LIMIT) return true;
  if (/\b(airdrop|guaranteed profit|dm me|telegram|whatsapp)\b/i.test(normalized)) {
    return true;
  }
  return false;
};

const CampaignDiscussionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasJwt, token, user } = useAuth();
  const { show: toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<Record<string, unknown> | null>(null);
  const [comments, setComments] = useState<Array<Record<string, unknown>>>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [draft, setDraft] = useState("");
  const [lastSubmittedAt, setLastSubmittedAt] = useState<number>(0);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [reportingCampaign, setReportingCampaign] = useState(false);

  const canPost = useMemo(() => Boolean(hasJwt && token), [hasJwt, token]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const details = await getCampaignDetails(id);
        const c = (details as { data?: { campaign?: Record<string, unknown> } })?.data?.campaign;
        if (!c) throw new Error("Campaign not found");
        if (!cancelled) setCampaign(c);

        const res = await getCampaignComments(id, 1, PAGE_SIZE);
        const data = (res as { data?: { comments?: Array<Record<string, unknown>>; pagination?: { currentPage?: number; totalPages?: number } } }).data;
        if (!cancelled) {
          setComments(data?.comments || []);
          setPage(data?.pagination?.currentPage || 1);
          setTotalPages(data?.pagination?.totalPages || 1);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Failed to load discussion";
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadMore = async () => {
    if (!id || page >= totalPages) return;
    try {
      const next = page + 1;
      const res = await getCampaignComments(id, next, PAGE_SIZE);
      const data = (res as { data?: { comments?: Array<Record<string, unknown>>; pagination?: { currentPage?: number; totalPages?: number } } }).data;
      setComments((prev) => [...prev, ...(data?.comments || [])]);
      setPage(data?.pagination?.currentPage || next);
      setTotalPages(data?.pagination?.totalPages || totalPages);
    } catch {
      toast({
        type: "warning",
        title: "Unable to load more",
        description: "Please try again.",
      });
    }
  };

  const submit = async () => {
    if (!id || !draft.trim() || !canPost || !token) return;

    const trimmed = draft.trim();
    if (trimmed.length > MAX_COMMENT_CHARS) {
      setError(`Comment must be under ${MAX_COMMENT_CHARS} characters.`);
      return;
    }

    if (hasLikelySpam(trimmed)) {
      setError(
        "Message looks like spam. Remove suspicious links/phrases and try again."
      );
      return;
    }

    const now = Date.now();
    if (lastSubmittedAt > 0) {
      const elapsed = (now - lastSubmittedAt) / 1000;
      if (elapsed < MIN_SECONDS_BETWEEN_COMMENTS) {
        setError(
          `Please wait ${Math.ceil(MIN_SECONDS_BETWEEN_COMMENTS - elapsed)}s before posting again.`
        );
        return;
      }
    }

    setPosting(true);
    setError(null);
    try {
      await createComment(id, { message: trimmed }, token);
      setDraft("");
      setLastSubmittedAt(Date.now());
      const res = await getCampaignComments(id, 1, PAGE_SIZE);
      const data = (res as { data?: { comments?: Array<Record<string, unknown>>; pagination?: { currentPage?: number; totalPages?: number } } }).data;
      setComments(data?.comments || []);
      setPage(data?.pagination?.currentPage || 1);
      setTotalPages(data?.pagination?.totalPages || 1);
      toast({
        type: "success",
        title: "Comment posted",
        description: "Thanks for contributing to the discussion.",
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to post comment";
      setError(msg);
    } finally {
      setPosting(false);
    }
  };

  const handleReportComment = async (commentId: string) => {
    if (!id || !token) {
      toast({
        type: "info",
        title: "Login required",
        description: "Please sign in before reporting abuse.",
      });
      return;
    }

    setReportingCommentId(commentId);
    try {
      await reportCampaignComment(
        id,
        commentId,
        {
          reason: "abuse_or_spam",
          details: "Reported from campaign discussion page",
        },
        token
      );
      toast({
        type: "success",
        title: "Comment reported",
        description: "Our moderation team will review this report.",
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to report comment";
      toast({
        type: "error",
        title: "Report failed",
        description: msg,
      });
    } finally {
      setReportingCommentId(null);
    }
  };

  const handleReportCampaign = async () => {
    if (!id || !token) {
      toast({
        type: "info",
        title: "Login required",
        description: "Please sign in before reporting campaigns.",
      });
      return;
    }

    setReportingCampaign(true);
    try {
      await reportCampaign(
        id,
        {
          reason: "campaign_integrity_concern",
          details: "Reported from campaign discussion page",
        },
        token
      );
      toast({
        type: "success",
        title: "Campaign reported",
        description: "Admin team has been notified for investigation.",
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to report campaign";
      toast({
        type: "error",
        title: "Report failed",
        description: msg,
      });
    } finally {
      setReportingCampaign(false);
    }
  };

  const displayTitle = String((campaign as { title?: string } | null)?.title || "");
  const currentUserId = String((user as { id?: string; _id?: string } | null)?.id || (user as { id?: string; _id?: string } | null)?._id || "");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center justify-between gap-3 mb-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6" /> Campaign Discussion
        </h1>
        <button
          onClick={handleReportCampaign}
          disabled={reportingCampaign}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-red-700 bg-red-50 disabled:opacity-60"
          title="Report campaign"
        >
          <Flag className="h-4 w-4" />
          {reportingCampaign ? "Reporting..." : "Report campaign"}
        </button>
      </div>
      {displayTitle && <p className="text-muted-foreground mb-6">{displayTitle}</p>}

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {!loading && comments.length === 0 && (
        <div className="border border-dashed border-border rounded-xl p-10 bg-muted/30 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-base font-medium">No comments yet</p>
          <p className="text-sm text-muted-foreground">
            Be the first to start the discussion.
          </p>
        </div>
      )}

      {comments.length > 0 && (
        <div className="space-y-3 mb-6">
          {comments.map((c) => {
            const commentId = String((c._id || c.id || "") as string);
            const author = (c.author as { _id?: string; name?: string } | undefined) || {};
            const authorName = String((c.authorName || author.name || "User") as string);
            const authorId = String((author._id || "") as string);
            const isOwnComment = Boolean(currentUserId && authorId && currentUserId === authorId);
            const created = String((c.createdAt || "") as string);
            const message = String((c.message || "") as string);

            return (
              <div key={commentId || `${authorName}-${created}`} className="p-4 border border-border rounded-lg bg-card">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-sm">{authorName}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">
                      {created ? new Date(created).toLocaleString() : ""}
                    </div>
                    {!isOwnComment && (
                      <button
                        onClick={() => handleReportComment(commentId)}
                        disabled={!commentId || reportingCommentId === commentId}
                        className="text-xs px-2 py-1 rounded-md border border-red-200 text-red-700 bg-red-50 disabled:opacity-60"
                        title="Report comment"
                      >
                        {reportingCommentId === commentId ? "Reporting..." : "Report"}
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-sm text-foreground mt-1 whitespace-pre-wrap">
                  {message}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {page < totalPages && (
        <div className="mt-2 mb-6 flex justify-center">
          <button
            onClick={loadMore}
            className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90"
          >
            Load more
          </button>
        </div>
      )}

      <div className="mt-4 border-t border-border pt-4">
        {canPost ? (
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="w-full">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Join the discussion..."
                rows={3}
                className="w-full px-4 py-2 border border-border rounded-xl bg-background"
              />
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Anti-spam checks enabled (rate-limit + suspicious link filter).</span>
                <span>{draft.trim().length}/{MAX_COMMENT_CHARS}</span>
              </div>
            </div>
            <button
              onClick={submit}
              disabled={posting || !draft.trim()}
              className="sm:self-stretch px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white disabled:opacity-60"
            >
              {posting ? "Posting..." : "Comment"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Please log in to post a comment.
          </p>
        )}
      </div>
    </div>
  );
};

export default CampaignDiscussionPage;
