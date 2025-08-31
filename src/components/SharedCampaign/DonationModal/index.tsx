import React from 'react';
import { PaymentMethod } from './types';

interface DonationModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  paymentMethod: 'crypto' | 'card';
  token: 'ETH' | 'USDC' | 'USDT';
  donationAmount: string;
  donorName: string;
  donorEmail: string;
  donationMessage: string;
  onClose: () => void;
  onDonate: () => void;
  onPaymentMethodChange: (method: 'crypto' | 'card') => void;
  onTokenChange: (token: 'ETH' | 'USDC' | 'USDT') => void;
  onDonationAmountChange: (amount: string) => void;
  onDonorNameChange: (name: string) => void;
  onDonorEmailChange: (email: string) => void;
  onDonationMessageChange: (message: string) => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  isProcessing,
  paymentMethod,
  token,
  donationAmount,
  donorName,
  donorEmail,
  donationMessage,
  onClose,
  onDonate,
  onPaymentMethodChange,
  onTokenChange,
  onDonationAmountChange,
  onDonorNameChange,
  onDonorEmailChange,
  onDonationMessageChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Support This Campaign</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              disabled={isProcessing}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Payment Method Tabs */}
          <div className="flex mb-6 border-b border-gray-200">
            <button
              className={`py-2 px-4 font-medium text-sm ${paymentMethod === 'crypto' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => onPaymentMethodChange('crypto')}
              disabled={isProcessing}
            >
              Crypto
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${paymentMethod === 'card' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => onPaymentMethodChange('card')}
              disabled={isProcessing}
            >
              Credit/Debit Card
            </button>
          </div>

          {/* Donation Amount */}
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Donation Amount ({paymentMethod === 'crypto' ? token : 'USD'})
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{paymentMethod === 'crypto' ? token : '$'}</span>
              </div>
              <input
                type="number"
                id="amount"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-12 sm:text-sm border-gray-300 rounded-md py-3"
                placeholder="0.00"
                value={donationAmount}
                onChange={(e) => onDonationAmountChange(e.target.value)}
                disabled={isProcessing}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Token Selector (Crypto only) */}
          {paymentMethod === 'crypto' && (
            <div className="mb-4">
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
                Token
              </label>
              <select
                id="token"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={token}
                onChange={(e) => onTokenChange(e.target.value as 'ETH' | 'USDC' | 'USDT')}
                disabled={isProcessing}
              >
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDC">USD Coin (USDC)</option>
                <option value="USDT">Tether (USDT)</option>
              </select>
            </div>
          )}

          {/* Donor Information */}
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name (Optional)
              </label>
              <input
                type="text"
                id="name"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3"
                placeholder="John Doe"
                value={donorName}
                onChange={(e) => onDonorNameChange(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            {paymentMethod === 'card' && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3"
                  placeholder="you@example.com"
                  value={donorEmail}
                  onChange={(e) => onDonorEmailChange(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
            )}

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message (Optional)
              </label>
              <textarea
                id="message"
                rows={3}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3"
                placeholder="Add a message of support..."
                value={donationMessage}
                onChange={(e) => onDonationMessageChange(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={onDonate}
            disabled={isProcessing || (paymentMethod === 'card' && !donorEmail) || !donationAmount}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isProcessing || (paymentMethod === 'card' && !donorEmail) || !donationAmount
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              `Donate ${donationAmount ? `${donationAmount} ${paymentMethod === 'crypto' ? token : 'USD'}` : ''}`.trim()
            )}
          </button>

          {paymentMethod === 'crypto' && (
            <p className="mt-3 text-xs text-gray-500 text-center">
              You'll be prompted to confirm the transaction in your wallet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationModal;
