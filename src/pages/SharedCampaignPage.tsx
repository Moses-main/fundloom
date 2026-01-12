import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Loader2, ArrowLeft, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Import the SharedCampaign component
import SharedCampaign from '../components/SharedCampaign';

// Mock data for development
const MOCK_CAMPAIGN = {
  id: '1',
  title: 'Sample Campaign',
  description: 'This is a sample campaign description that explains the purpose and goals of this fundraising campaign.',
  target_amount: 5000,
  raised_amount: 1250,
  deadline: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
  created_at: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
  is_active: true,
  charity_address: '0x1234567890abcdef1234567890abcdef12345678',
  image: '/sample-campaign.jpg',
  charity: {
    name: 'Sample Charity Foundation',
    description: 'Dedicated to making a difference in the community through various initiatives.',
    logo: '/charity-logo.png'
  },
  updates: [
    {
      id: '1',
      title: 'Campaign Successfully Launched!',
      content: 'We are excited to announce the launch of our new fundraising campaign!',
      date: new Date(),
      author: 'Admin'
    },
    {
      id: '2',
      title: 'First Milestone Reached',
      content: 'Thanks to your generous support, we\'ve reached 25% of our funding goal!',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      author: 'Admin'
    }
  ]
};

const SharedCampaignPage = () => {
  const { id: campaignId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [campaign, setCampaign] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        // In a real app, you would fetch the campaign data from your API
        // const response = await fetch(`/api/campaigns/${campaignId}`);
        // const data = await response.json();
        // setCampaign(data);
        
        // For now, use mock data and ensure it matches the expected format
        const mockCampaign = {
          ...MOCK_CAMPAIGN,
          // Ensure all required fields are present
          raised: MOCK_CAMPAIGN.raised_amount,
          target: MOCK_CAMPAIGN.target_amount,
          deadline: new Date(MOCK_CAMPAIGN.deadline).toISOString(),
          backers: 0, // Default value since it's not in the mock data
          walletAddress: MOCK_CAMPAIGN.charity_address,
          // Ensure updates have the correct format
          updates: MOCK_CAMPAIGN.updates.map(update => ({
            ...update,
            date: new Date(update.date).toISOString()
          }))
        };
        
        console.log('Setting campaign data:', mockCampaign);
        setCampaign(mockCampaign);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError('Failed to load campaign. Please try again later.');
        setIsLoading(false);
      }
    };

    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  const handleDonate = async (amount: number, tokenAddress: string) => {
    try {
      // In a real app, you would handle the donation logic here
      console.log(`Donating ${amount} of token ${tokenAddress} to campaign ${campaignId}`);
      
      // Redirect to login if not authenticated
      if (!isAuthenticated) {
        navigate('/login', { state: { from: window.location.pathname } });
        return;
      }
      
      // Simulate donation processing (replace with actual donation logic)
      // In a real app, this would involve interacting with your smart contract
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // After successful donation, redirect to thank you page
      navigate('/thank-you', {
        state: {
          campaign: {
            id: campaignId,
            title: campaign?.title || 'the campaign'
          },
          donationAmount: amount
        }
      });
      
    } catch (error) {
      console.error('Error processing donation:', error);
      // Handle error (e.g., show error toast)
      setError('Failed to process donation. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading campaign...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto p-4">
        <p>Campaign not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Campaigns
      </Button>
      
      <SharedCampaign 
        campaign={campaign} 
        onDonate={handleDonate} 
        isAuthenticated={isAuthenticated}
      />
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">About This Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{campaign.description}</p>
            
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Updates ({campaign.updates?.length || 0})</h3>
              {campaign.updates?.length > 0 ? (
                <div className="space-y-4">
                  {campaign.updates.map((update: any) => (
                    <div key={update.id} className="border-b pb-4 last:border-0">
                      <h4 className="font-medium">{update.title}</h4>
                      <p className="text-sm text-gray-600">
                        Posted by {update.author} • {formatDistanceToNow(new Date(update.date), { addSuffix: true })}
                      </p>
                      <p className="mt-1 text-gray-800">{update.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No updates yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SharedCampaignPage;
