import { useState, useCallback, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { useToast } from '@/components/ui/ToastProvider';

export type TokenType = 'ETH' | 'USDC' | 'USDT';

export interface DonationFormData {
  amount: string;
  token: TokenType;
  paymentMethod: 'crypto' | 'card';
  donorName: string;
  donorEmail: string;
  message: string;
}

export const useDonation = (onDonate: (amount: number, tokenAddress: string) => Promise<void>) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationData, setDonationData] = useState<DonationFormData>({
    amount: '',
    token: 'ETH',
    paymentMethod: 'crypto',
    donorName: '',
    donorEmail: '',
    message: '',
  });

  const { user } = useAuth();
  const { show: toast } = useToast();

  // Update donation data when user is authenticated
  useEffect(() => {
    if (user?.name) {
      setDonationData(prev => ({
        ...prev,
        donorName: user.name || '',
        donorEmail: user.email || '',
      }));
    }
  }, [user]);

  const handleDonate = useCallback(async () => {
    if (!donationData.amount) {
      toast({
        title: 'Error',
        description: 'Please enter a donation amount',
        type: 'error',
      });
      return;
    }

    const amount = parseFloat(donationData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid donation amount',
        type: 'error',
      });
      return;
    }

    try {
      setIsProcessing(true);
      await onDonate(amount, donationData.token);
      
      toast({
        title: 'Donation Successful!',
        description: 'Thank you for your generous donation!',
        type: 'success',
      });
      
      setShowDonationModal(false);
    } catch (error) {
      console.error('Donation failed:', error);
      toast({
        title: 'Donation Failed',
        description: 'There was an error processing your donation. Please try again.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [donationData, onDonate, toast]);

  const updateDonationData = useCallback((updates: Partial<DonationFormData>) => {
    setDonationData(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  return {
    donationData,
    isProcessing,
    showDonationModal,
    setShowDonationModal,
    handleDonate,
    updateDonationData,
  };
};

export default useDonation;
