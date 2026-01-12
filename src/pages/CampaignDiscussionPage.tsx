import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Inbox } from "lucide-react";
import {
  getCampaignDetails,
  getCampaignComments,
  createComment,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const PAGE_SIZE = 20;

const CampaignDiscussionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasJwt, token, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [draft, setDraft] = useState("");

  const canPost = useMemo(() => Boolean(hasJwt && token), [hasJwt, token]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        // Load campaign meta
        const details = await getCampaignDetails(id);
        const c = (details as any)?.data?.campaign;
        if (!c) throw new Error("Campaign not found");
        if (!cancelled) setCampaign(c);
        // Load first comments page
        const res = await getCampaignComments(id, 1, PAGE_SIZE);
        const { comments: list, pagination } = (res as any).data || {};
        if (!cancelled) {
          setComments(list || []);
          setPage(pagination?.currentPage || 1);
          setTotalPages(pagination?.totalPages || 1);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load discussion");
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
      const { comments: list, pagination } = (res as any).data || {};
      setComments((prev) => [...prev, ...(list || [])]);
      setPage(pagination?.currentPage || next);
      setTotalPages(pagination?.totalPages || totalPages);
    } catch {}
  };

  const submit = async () => {
    if (!id || !draft.trim() || !canPost || !token) return;
    setPosting(true);
    try {
      await createComment(id, { message: draft.trim() }, token);
      setDraft("");
      // Reload first page to reflect newest comments at top
      const res = await getCampaignComments(id, 1, PAGE_SIZE);
      const { comments: list, pagination } = (res as any).data || {};
      setComments(list || []);
      setPage(pagination?.currentPage || 1);
      setTotalPages(pagination?.totalPages || 1);
    } catch (e: any) {
      setError(e?.message || "Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <MessageSquare className="h-6 w-6" /> Campaign Discussion
      </h1>
      {campaign && (
        <p className="text-muted-foreground mb-6">{campaign.title}</p>
      )}

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
          {comments.map((c: any) => (
            <div
              key={c._id || c.id}
              className="p-4 border border-border rounded-lg bg-card"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">
                  {c.authorName || c.author?.name || "User"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                </div>
              </div>
              <div className="text-sm text-foreground mt-1 whitespace-pre-wrap">
                {c.message}
              </div>
            </div>
          ))}
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
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Join the discussion..."
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-xl bg-background"
            />
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
