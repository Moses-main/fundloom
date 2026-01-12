import React from 'react';
import { Button } from '@/components/ui/Button';
import { Share2, Heart } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

interface CampaignActionsProps {
  campaignId: string | number;
  campaignTitle: string;
  onDonateClick: () => void;
  onShare?: () => void;
  onCopyLink?: () => void;
  className?: string;
}

const CampaignActions: React.FC<CampaignActionsProps> = ({
  campaignId,
  campaignTitle,
  onDonateClick,
  onShare: onShareProp,
  onCopyLink: onCopyLinkProp,
  className = ''
}) => {
  const { show: toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      const nav = navigator as Navigator & { clipboard?: { writeText: (text: string) => Promise<void> } };
      if (!nav.clipboard) {
        throw new Error('Clipboard API not supported');
      }
      await nav.clipboard.writeText(text);
      toast({
        title: 'Link copied!',
        description: 'Campaign link has been copied to your clipboard.',
        type: 'success',
      });
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: 'Failed to copy',
        description: 'Could not copy to clipboard. Please try again.',
        type: 'error',
      });
      return false;
    }
  };

  const handleCopyLink = async () => {
    if (onCopyLinkProp) {
      onCopyLinkProp();
      return;
    }

    const shareUrl = `${window.location.origin}/campaigns/${campaignId}`;
    await copyToClipboard(shareUrl);
  };

  const handleShare = async () => {
    if (onShareProp) {
      onShareProp();
      return;
    }

    const shareUrl = `${window.location.origin}/campaigns/${campaignId}`;
    const nav = navigator as Navigator & { 
      share?: (data: { title: string; text: string; url: string }) => Promise<void>;
      clipboard?: { writeText: (text: string) => Promise<void> };
    };
    
    try {
      if (nav.share) {
        await nav.share({
          title: campaignTitle,
          text: `Check out this campaign: ${campaignTitle}`,
          url: shareUrl,
        });
      } else if (nav.clipboard) {
        await copyToClipboard(shareUrl);
      } else {
        throw new Error('Sharing not supported');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast({
          title: 'Sharing failed',
          description: 'Could not share the campaign. Please try again or copy the URL manually.',
          type: 'error',
        });
      }
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      <Button
        onClick={onDonateClick}
        className="flex-1 bg-primary hover:bg-primary/90 text-white py-6 text-lg font-semibold"
      >
        <Heart className="mr-2 h-5 w-5" />
        Donate Now
      </Button>
      <Button
        variant="outline"
        onClick={handleShare}
        className="flex-1 py-6 text-lg font-semibold"
      >
        <Share2 className="mr-2 h-5 w-5" />
        Share
      </Button>
    </div>
  );
};

export default CampaignActions;
