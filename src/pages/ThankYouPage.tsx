import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Share2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { show: toast } = useToast();
  
  // Get the campaign details from location state
  const { campaign, donationAmount } = (location.state as { 
    campaign: { id: string; title: string; };
    donationAmount: number;
  }) || {};

  // Set a default title if no campaign is found
  const campaignTitle = campaign?.title || 'this campaign';
  
  const handleShare = async () => {
    try {
      const shareData = {
        title: `I just donated to ${campaignTitle}!`,
        text: `I just donated ${donationAmount} to ${campaignTitle}. Join me in supporting this cause!`,
        url: window.location.origin + `/campaigns/${campaign?.id || ''}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: 'Link copied to clipboard!',
          description: 'Share this campaign with your friends using the link.',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: 'Error sharing',
        description: 'Could not share the campaign. Please try again.',
        type: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Thank You for Your Donation!
        </h1>
        
        {donationAmount && (
          <p className="mt-2 text-gray-600">
            Your generous donation of ${donationAmount} to {campaignTitle} is greatly appreciated.
          </p>
        )}
        
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Help us reach more people
          </h2>
          
          <p className="text-gray-600 mb-6">
            Share this campaign with your friends and family to help us reach our goal faster!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleShare}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share This Campaign
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate(`/campaigns/${campaign?.id || ''}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Campaign
            </Button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              A receipt has been sent to your email. Thank you for your support!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
