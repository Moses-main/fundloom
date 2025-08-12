// src/components/DiscussionBoard.tsx
import React from "react";
import { useAppContext } from "../context/AppContext";

const DiscussionBoard: React.FC = () => {
  const {
    comments,
    selectedCampaign,
    addComment,
    commentDraft,
    setCommentDraft,
  } = useAppContext() as any;

  if (!selectedCampaign) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h4 className="font-semibold text-gray-900 mb-4">Discussion</h4>
      <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
        {comments
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
          ))}
      </div>

      <div className="flex space-x-3">
        <input
          value={commentDraft}
          onChange={(e) => setCommentDraft(e.target.value)}
          placeholder="Join the discussion..."
          className="flex-1 px-4 py-2 border border-gray-200 rounded-xl"
        />
        <button
          onClick={() => addComment(selectedCampaign.id)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl"
        >
          Comment
        </button>
      </div>
    </div>
  );
};

export default DiscussionBoard;
