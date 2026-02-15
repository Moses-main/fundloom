// src/components/DonationCard.tsx
import React, { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { Progress } from "./ui/Progress";
import { Heart, Share2, CreditCard, Wallet, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./ui/ToastProvider";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { FUNDLOOM_CONTRACT_ADDRESS, FUNDLOOM_ABI } from "../config/contracts";

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

export function DonationCard({ campaign }: DonationCardProps) {
  const [donationAmount, setDonationAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('crypto');
  const [isDonating, setIsDonating] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();
  const { show: showToast } = useToast();
  const navigate = useNavigate();
  
  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window.ethereum !== 'undefined';
  
  // Initialize contract
  const getContract = () => {
    if (!isMetaMaskInstalled) return null;
    
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();
    return new ethers.Contract(FUNDLOOM_CONTRACT_ADDRESS, FUNDLOOM_ABI, signer);
  };
  
  // Check if wallet is connected
  const checkIfWalletIsConnected = async () => {
    if (!isMetaMaskInstalled) return;
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
      }
    } catch (error) {
      console.error('Error checking connected accounts:', error);
    }
  };
  
  // Connect wallet handler
  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      showToast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to connect your wallet.",
        type: "error"
      });
      return;
    }
    
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      showToast({
        title: "Connection Error",
        description: "Failed to connect wallet. Please try again.",
        type: "error"
      });
    }
  };
  
  // Initialize wallet connection on component mount
  useEffect(() => {
    checkIfWalletIsConnected();
    
    // Listen for account changes
    if (isMetaMaskInstalled) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setCurrentAccount(accounts[0] || null);
      });
    }
    
    return () => {
      if (isMetaMaskInstalled) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);
  
  // Helper to convert ETH to Wei
  const toWei = (eth: string): string => {
    return ethers.utils.parseEther(eth).toString();
  };
  
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
  
  // Calculate campaign progress and days left
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
      if (paymentMethod === 'crypto' && currentAccount) {
        const contract = getContract();
        if (!contract) throw new Error("Failed to initialize contract");
        
        // Convert donation amount to Wei
        const amountInWei = toWei(donationAmount);
        
        // Call the donate function on the contract
        const tx = await contract.donateETH(campaign.id.toString(), {
          value: amountInWei,
        });
        
        // Wait for transaction to be mined
        await tx.wait();
        
        setTransactionHash(tx.hash);
        
        showToast({
          title: "Donation Successful!",
          description: `Thank you for your donation of ${donationAmount} ETH to ${campaign.title}`,
        });
        
        // Reset form
        setDonationAmount("");
      } else {
        // Handle other payment methods (card, bank transfer)
        // This would typically involve calling your backend API
        // to process the payment
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showToast({
          title: "Donation Processed",
          description: `Your donation of $${donationAmount} has been processed successfully!`,
        });
        
        // Reset form
        setDonationAmount("");
      }
    } catch (error) {
      console.error('Error processing donation:', error);
      
      showToast({
        title: "Donation Failed",
        description: error instanceof Error ? error.message : "There was an error processing your donation. Please try again.",
        type: "error"
      });
    } finally {
      setIsDonating(false);
    }
  };
  
  // Return the JSX for the donation card
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
              href={`https://basescan.org/tx/${transactionHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800"
              title="View on block explorer"
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
          {paymentMethod === 'crypto' && (
            <div className="mt-4 p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Wallet className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">
                  {currentAccount ? 'Connected Wallet' : 'Connect Wallet'}
                </span>
              </div>
              {currentAccount ? (
                <div className="text-sm text-muted-foreground">
                  {`${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`}
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={connectWallet}
                  disabled={!isMetaMaskInstalled}
                >
                  {isMetaMaskInstalled ? 'Connect MetaMask' : 'Install MetaMask'}
                </Button>
              )}
              {!isMetaMaskInstalled && (
                <p className="mt-2 text-xs text-muted-foreground">
                  MetaMask is required for crypto donations
                </p>
              )}
            </div>
          )}
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
