import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '../components/ui/ToastProvider';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Campaign {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  imageUrl: string;
  creator: {
    name: string;
    avatar: string;
  };
}

export default function SharedCampaignPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { show: showToast } = useToast();

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}`);
        if (!response.ok) {
          throw new Error('Campaign not found');
        }
        const data = await response.json();
        setCampaign(data);
      } catch (err) {
        setError('Failed to load campaign');
        showToast({
          title: 'Error',
          description: 'Could not load the campaign. It may have been removed or the link is invalid.',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId, toast]);

  const handleDonateClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/campaign/${campaignId}` } });
      return;
    }
    navigate(`/campaign/${campaignId}/donate`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
        <p className="mb-4">The campaign you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  const progress = Math.min((campaign.currentAmount / campaign.targetAmount) * 100, 100);
  const daysLeft = formatDistanceToNow(new Date(campaign.deadline), { addSuffix: true });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Support a Meaningful Cause</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join us in making a difference. Your contribution helps create positive change.
          </p>
        </div>
      </div>

      {/* Campaign Card */}
      <div className="container mx-auto px-4 py-12 -mt-12">
        <Card className="max-w-3xl mx-auto shadow-lg overflow-hidden">
          {campaign.imageUrl && (
            <div className="h-64 bg-gray-200 overflow-hidden">
              <img 
                src={campaign.imageUrl} 
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{campaign.title}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Created by {campaign.creator.name}
                </p>
              </div>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {daysLeft}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-6">{campaign.description}</p>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Raised: ${campaign.currentAmount.toLocaleString()}</span>
                  <span>Goal: ${campaign.targetAmount.toLocaleString()}</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-right text-sm text-gray-500 mt-1">
                  {progress.toFixed(1)}% funded
                </p>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleDonateClick}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg"
                >
                  Donate Now
                </Button>
                
                {!isAuthenticated && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    You'll need to sign in to make a donation
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info Section */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">How Your Donation Helps</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Direct Impact</h3>
              <p className="text-gray-600 text-sm">Your donation goes directly to support this cause and make a real difference.</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Trust & Transparency</h3>
              <p className="text-gray-600 text-sm">We ensure complete transparency in how funds are used and distributed.</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Community Support</h3>
              <p className="text-gray-600 text-sm">Join a community of like-minded individuals making a positive impact.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
