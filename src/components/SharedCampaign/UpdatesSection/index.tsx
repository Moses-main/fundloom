import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Update {
  id: string | number;
  title: string;
  content: string;
  date: string | Date;
  author?: string;
}

interface UpdatesSectionProps {
  updates: Update[];
  campaignId: string | number;
  isAuthenticated?: boolean;
}

export const UpdatesSection: React.FC<UpdatesSectionProps> = ({ updates, campaignId }) => {
  if (!updates || updates.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Updates ({updates.length})</h2>
            
            <div className="space-y-8">
              {updates.map((update) => (
                <article key={update.id} className="pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-900">{update.title}</h3>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(update.date), { addSuffix: true })}
                    </span>
                  </div>
                  {update.author && (
                    <p className="text-sm text-gray-500 mt-1">Posted by {update.author}</p>
                  )}
                  <div className="mt-3 text-gray-600 whitespace-pre-line">
                    {update.content}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpdatesSection;
