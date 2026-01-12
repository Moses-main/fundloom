import React from 'react';
import { Progress } from '@/components/ui/Progress';
import { formatDistanceToNow } from 'date-fns';

interface CampaignInfo {
  title: string;
  description: string;
  raised: number;
  target: number;
  deadline: string | number | Date;
  backers: number;
  image?: string;
  charity?: {
    name: string;
    description?: string;
    logo?: string;
  };
}

interface InfoSectionProps {
  campaign: CampaignInfo;
  onDonateClick: () => void;
}

export const InfoSection: React.FC<InfoSectionProps> = ({ campaign, onDonateClick }) => {
  const progress = Math.min(Math.round((campaign.raised / campaign.target) * 100), 100);
  const daysLeft = formatDistanceToNow(new Date(campaign.deadline), { addSuffix: true });

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {campaign.image && (
                <img
                  className="w-full h-64 object-cover"
                  src={campaign.image}
                  alt={campaign.title}
                />
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About this campaign</h2>
                <p className="text-gray-600 whitespace-pre-line">
                  {campaign.description}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Raised: ${campaign.raised.toLocaleString()}</span>
                    <span>Goal: ${campaign.target.toLocaleString()}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="mt-2 text-sm text-gray-600">
                    {progress}% funded • {campaign.backers} backers • {daysLeft}
                  </div>
                </div>

                <button
                  onClick={onDonateClick}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md shadow-sm"
                >
                  Donate Now
                </button>

                {campaign.charity && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Benefiting</h3>
                    <div className="mt-2 flex items-center">
                      {campaign.charity.logo && (
                        <img
                          className="h-10 w-10 rounded-full object-cover mr-3"
                          src={campaign.charity.logo}
                          alt={campaign.charity.name}
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{campaign.charity.name}</p>
                        {campaign.charity.description && (
                          <p className="text-xs text-gray-500">{campaign.charity.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
