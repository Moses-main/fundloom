import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Campaign } from '../types';

export const useCampaign = (initialCampaign?: Campaign | null) => {
  const [campaign, setCampaign] = useState<Campaign | null>(initialCampaign || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialCampaign);
  const [error, setError] = useState<string | null>(null);
  const { id: campaignId } = useParams<{ id?: string }>();
  const searchParams = new URLSearchParams(window.location.search);
  const campaignIdFromQuery = searchParams.get('campaign');
  const effectiveCampaignId = campaignIdFromQuery || campaignId;

  const fetchCampaign = useCallback(async () => {
    if (!effectiveCampaignId) {
      setError('No campaign ID provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/campaigns/${effectiveCampaignId}`);
      // const data = await response.json();
      // setCampaign(data);
      
      // Mock data for now
      const mockCampaign: Campaign = {
        id: effectiveCampaignId,
        title: 'Sample Campaign',
        description: 'This is a sample campaign',
        raised: 0,
        target: 10000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        backers: 0,
        updates: []
      };
      setCampaign(mockCampaign);
    } catch (err) {
      setError('Failed to load campaign');
      console.error('Error fetching campaign:', err);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveCampaignId]);

  useEffect(() => {
    if (!initialCampaign) {
      fetchCampaign();
    }
  }, [fetchCampaign, initialCampaign]);

  return {
    campaign,
    isLoading,
    error,
    refetch: fetchCampaign,
    campaignId: effectiveCampaignId
  };
};

export default useCampaign;
