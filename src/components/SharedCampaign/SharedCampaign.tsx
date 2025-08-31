import React, { useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";
import { useToast } from '@/components/ui/ToastProvider';

// Hooks
import useCampaign from './hooks/useCampaign';
import useDonation from './hooks/useDonation';

// Components
import { DonationModal } from './DonationModal';
import { Header } from './Header';
import { InfoSection } from './InfoSection';
import { UpdatesSection } from './UpdatesSection';
import { CampaignActions } from './components';

// Types
import type { Campaign } from './types';
import { DonationFormData } from './hooks/useDonation';

interface SharedCampaignProps {
  campaign?: Campaign | null;
  onDonate: (amount: number, tokenAddress: string) => Promise<void>;
  isAuthenticated?: boolean;
}

const SharedCampaign: React.FC<SharedCampaignProps> = ({ 
  campaign: propCampaign, 
  onDonate, 
  isAuthenticated: propIsAuthenticated 
}) => {
  // Hooks
  const { isAuthenticated: authIsAuthenticated, user } = useAuth();
  const isAuthenticated = propIsAuthenticated ?? authIsAuthenticated;
  const { show: toast } = useToast();
  const navigate = useNavigate();
  
  // Use custom hooks
  const { 
    campaign, 
    isLoading, 
    error, 
    campaignId, 
    refetch: refetchCampaign 
  } = useCampaign(propCampaign);
  
  // Setup donation handling
  const {
    donationData,
    isProcessing,
    showDonationModal,
    setShowDonationModal,
    handleDonate: handleDonation,
    updateDonationData
  } = useDonation(onDonate);

  // Memoize the campaign header props to prevent unnecessary re-renders
  const headerProps = useMemo(() => ({
    title: campaign?.title || '',
    description: campaign?.description || '',
    raised: campaign?.raised || 0,
    target: campaign?.target || 0,
    deadline: campaign?.deadline ? new Date(campaign.deadline) : new Date(),
    backers: campaign?.backers || 0,
    image: campaign?.image,
    charity: campaign?.charity,
  }), [campaign]);

  // Handle retry loading campaign data
  const handleRetry = useCallback(() => {
    if (campaignId) {
      refetchCampaign();
    } else {
      navigate('/');
    }
  }, [campaignId, refetchCampaign, navigate]);

  // Handle donation button click
  const handleDonateClick = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    setShowDonationModal(true);
  }, [isAuthenticated, navigate, setShowDonationModal]);

  // Handle sharing the campaign
  const handleShare = useCallback(async () => {
    if (!campaign) return;
    
    const shareUrl = `${window.location.origin}/campaigns/${campaign.id}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: campaign.title,
          text: `Check out this campaign: ${campaign.title}`,
          url: shareUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'Link copied!',
          description: 'Campaign link has been copied to your clipboard.',
          type: 'success',
        });
      } else {
        toast({
          title: 'Copy this URL',
          description: `Please copy this URL: ${shareUrl}`,
          type: 'info',
        });
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        toast({
          title: 'Sharing failed',
          description: 'Could not share the campaign. Please try again or copy the URL manually.',
          type: 'error',
        });
      }
    }
  }, [campaign, toast]);
  
  // Handle copying the campaign link
  const handleCopyLink = useCallback(async () => {
    if (!campaign) return;
    
    const url = `${window.location.origin}/campaigns/${campaign.id}`;
    
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied!',
        description: 'Campaign link has been copied to your clipboard.',
        type: 'success',
      });
    } catch (err) {
      toast({
        title: 'Failed to copy link',
        description: `Please copy the URL manually: ${url}`,
        type: 'error',
      });
    }
  }, [campaign, toast]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900">Error Loading Campaign</h2>
          <p className="text-gray-600">
            {error || 'The campaign could not be loaded. Please check the URL and try again.'}
          </p>
          <div className="mt-6">
            <button
              onClick={handleRetry}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/')}
              className="mt-3 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Back to Home
            </button>
          </div>
          <div className="mt-8 p-4 bg-gray-100 rounded-md text-left text-sm">
            <p className="font-medium">Debug Info:</p>
            <p>Campaign ID: {campaignId || 'Not found'}</p>
            <p>Error: {error || 'No error details available'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with campaign info */}
      <Header 
        {...headerProps} 
        onDonateClick={handleDonateClick} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <InfoSection
              campaign={{
                ...campaign,
                raised: campaign.raised,
                target: campaign.target,
                deadline: campaign.deadline,
                backers: campaign.backers,
              }}
              onDonateClick={handleDonateClick}
            />

            <UpdatesSection
              updates={campaign.updates || []}
              campaignId={campaign.id}
              isAuthenticated={isAuthenticated}
            />
          </div>

          {/* Sidebar with actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <CampaignActions 
                campaignId={campaign.id}
                campaignTitle={campaign.title}
                onDonateClick={handleDonateClick}
                onShare={handleShare}
                onCopyLink={handleCopyLink}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Donation Modal */}
      <DonationModal
        isOpen={showDonationModal}
        isProcessing={isProcessing}
        paymentMethod={donationData.paymentMethod}
        token={donationData.token}
        donationAmount={donationData.amount}
        donorName={donationData.donorName || user?.name || ''}
        donorEmail={donationData.donorEmail || user?.email || ''}
        donationMessage={donationData.message}
        onClose={() => setShowDonationModal(false)}
        onDonate={handleDonation}
        onPaymentMethodChange={(method) => updateDonationData({ paymentMethod: method })}
        onTokenChange={(token) => updateDonationData({ token })}
        onDonationAmountChange={(amount) => updateDonationData({ amount })}
        onDonorNameChange={(name) => updateDonationData({ donorName: name })}
        onDonorEmailChange={(email) => updateDonationData({ donorEmail: email })}
        onDonationMessageChange={(message) => updateDonationData({ message })}
      />
    </div>
  );
};

export default SharedCampaign;
