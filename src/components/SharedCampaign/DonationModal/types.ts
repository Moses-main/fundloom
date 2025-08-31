export type TokenType = 'ETH' | 'USDC' | 'USDT';
export type PaymentMethod = 'crypto' | 'card';

export interface DonationFormData {
  amount: string;
  token: TokenType;
  paymentMethod: PaymentMethod;
  donorName: string;
  donorEmail: string;
  message: string;
}

export interface DonationModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  formData: DonationFormData;
  onClose: () => void;
  onSubmit: (data: DonationFormData) => void;
  onInputChange: (field: keyof DonationFormData, value: string) => void;
}
