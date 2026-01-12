// src/components/DiscussionBoard.tsx
import React from "react";
import { useAppContext } from "../context/AppContext";

const DiscussionBoard: React.FC = () => {
  const ctx = useAppContext() as any;
  const {
    comments,
    selectedCampaign,
    addComment,
    commentDraft,
    setCommentDraft,
    detailsLoading,
    detailsError,
    backendComments,
  } = ctx;

  if (!selectedCampaign) return null;

  const isBackend = !!(selectedCampaign as any).backendId;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h4 className="font-semibold text-gray-900 mb-4">Discussion</h4>
      <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
        {isBackend ? (
          detailsLoading ? (
            <>
              <div className="h-12 bg-gray-100 rounded animate-pulse" />
              <div className="h-12 bg-gray-100 rounded animate-pulse" />
              <div className="h-12 bg-gray-100 rounded animate-pulse" />
            </>
          ) : detailsError ? (
            <div className="text-sm text-red-600">{detailsError}</div>
          ) : backendComments && backendComments.length > 0 ? (
            backendComments.map((c: any) => (
              <div key={c._id || c.id} className="p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{c.authorName || c.author?.name || "User"}</div>
                  <div className="text-xs text-gray-400">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}
                  </div>
                </div>
                <div className="text-sm text-gray-700 mt-1">{c.message}</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No comments yet.</div>
          )
        ) : (
          comments
            .filter((c: any) => c.campaign_id === selectedCampaign.id)
            .map((c: any) => (
              <div key={c.id} className="p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{c.author}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(c.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm text-gray-700 mt-1">{c.message}</div>
              </div>
            ))
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
        <input
          value={commentDraft}
          onChange={(e) => setCommentDraft(e.target.value)}
          placeholder="Join the discussion..."
          className="w-full sm:flex-1 px-4 py-2 border border-gray-200 rounded-xl"
        />
        <button
          onClick={() => addComment(selectedCampaign.id)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl w-full sm:w-auto"
        >
          Comment
        </button>
      </div>
    </div>
  );
};

export default DiscussionBoard;
