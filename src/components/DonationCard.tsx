// src/components/DonationCard.tsx
import { Button } from "./ui/Button";
import { Progress } from "./ui/Progress";
import { Heart, Share2, CreditCard, Wallet, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./ui/ToastProvider";
import { useNavigate } from "react-router-dom";
import { useContract, useAccount } from "@starknet-react/core";
import { FUNDLOOM_CONTRACT_ADDRESS, FUNDLOOM_ABI } from "../config/contracts";
import React from 'react';

type PaymentMethod = 'crypto' | 'card' | 'bank';

interface DonationCardProps {
  campaign: {
    id: string | number;
    title: string;
    raised_amount: number;
    target_amount: number;
    deadline: number;
    is_active: boolean;
  };
}

// Helper function to convert ETH to Wei (1 ETH = 1e18 Wei)
const toWei = (eth: string): string => {
  try {
    return (Number(eth) * 1e18).toString();
  } catch (error) {
    console.error('Error converting to wei:', error);
    return '0';
  }
};

export function DonationCard({ campaign }: DonationCardProps) {
  const [donationAmount, setDonationAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('crypto');
  const [isDonating, setIsDonating] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  
  const { isAuthenticated } = useAuth();
  const { show: showToast } = useToast();
  const navigate = useNavigate();
  
  // Get the connected account
  const { account } = useAccount();
  
  // Initialize the contract
  const { contract } = useContract({
    abi: FUNDLOOM_ABI as any, // Type assertion for now
    address: FUNDLOOM_CONTRACT_ADDRESS,
  });
  
  // Effect to handle transaction status
  useEffect(() => {
    if (transactionHash) {
      showToast({
        title: "Transaction Submitted",
        description: `Your donation of ${donationAmount} ETH has been submitted.`
      });
      
      // Refresh the page after a delay to show updated campaign data
      const timer = setTimeout(() => {
        window.location.reload();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [transactionHash, donationAmount, showToast]);
  
  const progress = Math.min(
    (campaign.raised_amount / campaign.target_amount) * 100,
    100
  );
  
  const daysLeft = Math.max(
    0,
    Math.ceil((campaign.deadline * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
  );
  const progress = Math.min(
    (campaign.raised_amount / campaign.target_amount) * 100,
    100
  );
  const daysLeft = Math.max(
    0,
    Math.ceil((campaign.deadline * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!donationAmount) {
      showToast({
        title: "Error",
        description: "Please enter a donation amount"
      });
      return;
    }
    
    if (paymentMethod === 'crypto' && !isAuthenticated) {
      showToast({
        title: "Authentication Required",
        description: "Please connect your wallet to make a crypto donation"
      });
      navigate('/auth');
      return;
    }
    
    setIsDonating(true);
    
    try {
      if (paymentMethod === 'crypto') {
        if (!contract) {
          throw new Error("Contract not initialized");
        }
        
        // Convert ETH amount to Wei (1 ETH = 1e18 Wei)
        const amountInWei = toWei(donationAmount);
        
        // Execute the contract call
        const tx = await contract.donate(
          campaign.id.toString(),
          { value: amountInWei }
        );
        
        // Store the transaction hash to show to the user
        if (tx?.transaction_hash) {
          setTransactionHash(tx.transaction_hash);
        }
        
        showToast({
          title: "Transaction Submitted!",
          description: "Your donation is being processed on the blockchain."
        });
      } else {
        // For fiat payments, we'll handle this differently (e.g., Stripe integration)
        // For now, we'll just show a success message
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showToast({
          title: "Thank you for your donation!",
          description: `You've successfully donated $${donationAmount} to this campaign.`
        });
      }
      
      // Reset the form
      setDonationAmount("");
    } catch (error) {
      console.error("Donation error:", error);
      
      let errorMessage = "There was an error processing your donation. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      showToast({
        title: "Donation Failed",
        description: errorMessage
      });
    } finally {
      setIsDonating(false);
    }
  };
  
  // Return the JSX
  return (
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Make a Donation</h3>
        <div className="flex space-x-2">
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              showToast({
                title: "Link Copied!",
                description: "Campaign link copied to clipboard.",
                type: "success",
              });
            }}
          >
            <Share2 className="w-5 h-5" />
          </button>
          {transactionHash && (
            <a 
              href={`https://voyager.online/tx/${transactionHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800"
              title="View on Voyager"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Raised: ${campaign.raised_amount.toLocaleString()}
          </span>
          <span className="text-gray-600">
            Goal: ${campaign.target_amount.toLocaleString()}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{progress.toFixed(1)}% funded</span>
          <span>{daysLeft} days left</span>
        </div>
      </div>

      <form onSubmit={handleDonate} className="space-y-4">
        {/* Payment Method Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('crypto')}
              className={`flex items-center justify-center p-3 border rounded-md ${
                paymentMethod === 'crypto' 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Wallet className="w-5 h-5 mr-2" />
              <span>Crypto</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex items-center justify-center p-3 border rounded-md ${
                paymentMethod === 'card' 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              <span>Card</span>
            </button>
          </div>
        </div>

        {/* Donation Amount */}
        <div>
          <label htmlFor="donation-amount" className="block text-sm font-medium text-gray-700 mb-1">
            Donation Amount
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="donation-amount"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
              placeholder="0.00"
              min="1"
              step="0.01"
              disabled={isDonating}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500 sm:text-sm">
                USD
              </span>
            </div>
          </div>
          {paymentMethod === 'crypto' && (
            <p className="mt-1 text-xs text-gray-500">
              You'll be asked to confirm the transaction in your wallet
            </p>
          )}
        </div>

        {/* Quick Donation Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {[10, 25, 50].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setDonationAmount(amount.toString())}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-3 rounded-md transition-colors"
            >
              ${amount}
            </button>
          ))}
        </div>
        <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2"
          disabled={isDonating || !donationAmount}
        >
          {isDonating ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {paymentMethod === 'crypto' ? 'Confirm in Wallet' : 'Processing...'}
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Heart className="w-4 h-4 mr-2" />
              {paymentMethod === 'crypto' && !isAuthenticated 
                ? 'Connect Wallet to Donate'
                : 'Donate Now'}
            </span>
          )}
        </Button>
      </form>

      {paymentMethod === 'crypto' && !isAuthenticated && (
        <p className="text-xs text-center text-gray-500">
          Connect your wallet to make a crypto donation
        </p>
      )}
      {paymentMethod === 'card' && !isAuthenticated && (
        <p className="text-xs text-center text-gray-500">
          Sign in to make a credit/debit card donation
        </p>
      )}
    </div>
  );
}
