"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Wallet, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useAuth } from "@/context/AuthContext";
import { formatAddress, isMobile } from "@/lib/utils";
import { providers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import WalletConnectProvider from "@walletconnect/ethereum-provider";

// WalletConnect configuration
const walletConnectConfig = {
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [1], // Ethereum Mainnet
  showQrModal: true,
  qrModalOptions: {
    themeVariables: {
      '--w3m-z-index': '10000', // Ensure it's above other elements
    },
  },
  metadata: {
    name: 'FundLoom',
    description: 'FundLoom - Decentralized Crowdfunding Platform',
    url: window.location.origin,
    icons: [`${window.location.origin}/logo192.png`]
  }
};

// Enhanced mobile detection
const isMobileDevice = isMobile();
const isInjectedWalletAvailable = typeof window.ethereum !== 'undefined';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletOption {
  id: 'metamask' | 'walletconnect' | 'coinbase';
  name: string;
  icon: string;
  description: string;
  popular?: boolean;
}

const walletOptions: WalletOption[] = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "🦊",
    description: "Connect using MetaMask wallet",
    popular: true,
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    icon: "🔗",
    description: "Connect with WalletConnect protocol",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "🔵",
    description: "Connect using Coinbase Wallet",
    popular: true,
  },
];

interface WalletAuthFormProps {
  mode: "login" | "signup";
}

export function WalletAuthForm({ mode }: WalletAuthFormProps) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<WalletOption['id'] | null>(null);
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<Web3Provider | null>(null);
  const { show: toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithWallet, logout, isAuthenticated } = useAuth();
  
  const next = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("next") || "/dashboard";
  }, [location.search]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(next, { replace: true });
    }
  }, [isAuthenticated, next, navigate]);

  // Initialize WalletConnect provider with better error handling
  const initWalletConnect = useCallback(async () => {
    try {
      if (!walletConnectConfig.projectId || walletConnectConfig.projectId === 'YOUR_PROJECT_ID') {
        throw new Error('WalletConnect project ID is not configured. Please set VITE_WALLETCONNECT_PROJECT_ID in your .env file.');
      }

      const walletConnectProvider = new WalletConnectProvider(walletConnectConfig);
      
      // Set up event listeners
      const handleAccountsChanged = (accounts: string[]) => {
        if (!accounts || accounts.length === 0) {
          // Wallet disconnected
          setEvmAddress(null);
          setConnectedWallet(null);
          setProvider(null);
        } else {
          setEvmAddress(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: number) => {
        console.log('Chain changed:', chainId);
        // Refresh the page on chain change
        window.location.reload();
      };

      const handleDisconnect = (code: number, reason: string) => {
        console.log('WalletConnect disconnected:', code, reason);
        setEvmAddress(null);
        setConnectedWallet(null);
        setProvider(null);
      };

      // Subscribe to events
      walletConnectProvider.on('accountsChanged', handleAccountsChanged);
      walletConnectProvider.on('chainChanged', handleChainChanged);
      walletConnectProvider.on('disconnect', handleDisconnect);

      // Cleanup function
      return () => {
        walletConnectProvider.off('accountsChanged', handleAccountsChanged);
        walletConnectProvider.off('chainChanged', handleChainChanged);
        walletConnectProvider.off('disconnect', handleDisconnect);
      };
    } catch (error) {
      console.error('Error initializing WalletConnect:', error);
      throw new Error(`Failed to connect with WalletConnect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      if (connectedWallet === 'walletconnect' && provider) {
        // For WalletConnect, we need to manually disconnect the session
        const walletConnectProvider = (provider as any).provider;
        if (walletConnectProvider?.disconnect) {
          await walletConnectProvider.disconnect();
        }
      }
      
      // Clear state
      setEvmAddress(null);
      setConnectedWallet(null);
      setProvider(null);
      setError(null);
      
      // Logout from the app
      await logout();
      
      toast({
        title: 'Wallet disconnected',
        description: 'You have been successfully disconnected from your wallet.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect wallet. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle wallet connection with improved error handling and mobile support
  const connectWallet = async (walletId: WalletOption['id']) => {
    try {
      setError(null);
      setIsConnecting(walletId);
      
      let web3Provider: Web3Provider;
      let accounts: string[] = [];
      
      // Handle different wallet connections
      switch (walletId) {
        case 'metamask':
          if (!isInjectedWalletAvailable) {
            const metamaskAppUrl = `https://metamask.app.link/dapp/${window.location.hostname}`;
            if (isMobileDevice) {
              window.open(metamaskAppUrl, '_blank');
              throw new Error('Please install MetaMask or open in MetaMask browser');
            } else {
              window.open('https://metamask.io/download.html', '_blank');
              throw new Error('Please install MetaMask extension');
            }
          }
          
          if (!window.ethereum?.isMetaMask) {
            throw new Error('MetaMask not detected');
          }
          
          try {
            web3Provider = new Web3Provider(window.ethereum, 'any');
            setProvider(web3Provider);
            accounts = await web3Provider.send('eth_requestAccounts', []);
            
            if (!accounts || accounts.length === 0) {
              throw new Error('No accounts found. Please unlock your wallet.');
            }
            
            setConnectedWallet('metamask');
            setEvmAddress(accounts[0]);
            
            // Set up event listeners for MetaMask
            window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
              if (!newAccounts || newAccounts.length === 0) {
                // Handle account disconnection
                setEvmAddress(null);
                setConnectedWallet(null);
                setProvider(null);
              } else if (newAccounts[0] !== evmAddress) {
                // Account changed
                setEvmAddress(newAccounts[0]);
              }
            });
            
            window.ethereum.on('chainChanged', () => {
              window.location.reload();
            });
            
          } catch (err) {
            const error = err as Error;
            console.error('MetaMask connection error:', error);
            throw new Error(`Failed to connect to MetaMask: ${error.message}`);
          }
          break;
          
        case 'coinbase':
          if (isMobileDevice) {
            // On mobile, try to use WalletLink/Coinbase Wallet app
            window.open(`https://go.cb-w.com/`, '_blank');
            throw new Error('Please use Coinbase Wallet app');
          }
          
          if (!window.ethereum?.isCoinbaseWallet && !window.ethereum?.providers?.find(p => p.isCoinbaseWallet)) {
            window.open('https://www.coinbase.com/wallet/downloads', '_blank');
            throw new Error('Please install Coinbase Wallet extension');
          }
          
          // Use Coinbase provider if available, otherwise fallback to window.ethereum
          const coinbaseProvider = window.ethereum?.providers?.find(p => p.isCoinbaseWallet) || window.ethereum;
          web3Provider = new Web3Provider(coinbaseProvider, 'any');
          setProvider(web3Provider);
          accounts = await web3Provider.send('eth_requestAccounts', []);
          break;
          
        case 'walletconnect':
          const walletConnectProvider = await initWalletConnect();
          
          // Enable session (triggers QR Code modal)
          await walletConnectProvider.enable();
          
          // Create Web3Provider instance
          web3Provider = new Web3Provider(walletConnectProvider);
          setProvider(web3Provider);
          
          // Get accounts
          accounts = await web3Provider.listAccounts();
          
          // If no accounts, request them
          if (!accounts || accounts.length === 0) {
            accounts = await web3Provider.send('eth_requestAccounts', []);
          }
          break;
          
        default:
          throw new Error('Unsupported wallet');
      }
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      const address = accounts[0];
      setEvmAddress(address);
      setConnectedWallet(walletId);
      
      // Sign message and authenticate with backend
      if (!web3Provider) {
        throw new Error('Provider not initialized');
      }
      const signer = web3Provider.getSigner();
      const message = `Welcome to FundLoom!\n\nPlease sign this message to verify your wallet.\n\nNonce: ${Date.now()}`;
      const signature = await signer.signMessage(message);
      
      // Authenticate with backend
      await loginWithWallet({
        address,
        signature,
        message,
        walletType: walletId
      });
      
      // Navigate to dashboard after successful authentication
      navigate(next, { replace: true });
      
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
      toast({
        title: 'Connection Error',
        description: err.message || 'Failed to connect wallet',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(null);
    }
  };
  
  // Handle account and chain changes for injected providers
  useEffect(() => {
    if (!window.ethereum || connectedWallet === 'walletconnect') return;
    
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // Wallet disconnected
        setEvmAddress(null);
        setConnectedWallet(null);
        setProvider(null);
      } else if (evmAddress && evmAddress.toLowerCase() !== accounts[0].toLowerCase()) {
        // Account changed
        setEvmAddress(accounts[0]);
        // You might want to re-authenticate with the new account here
      }
    };
    
    const handleChainChanged = (chainId: string) => {
      console.log('Chain changed:', chainId);
      // You might want to handle chain changes here
      window.location.reload();
    };
    
    const handleDisconnect = () => {
      setEvmAddress(null);
      setConnectedWallet(null);
      setProvider(null);
    };
    
    // Set up event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);
    
    return () => {
      // Clean up event listeners
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
      window.ethereum?.removeListener('disconnect', handleDisconnect);
    };
  }, [evmAddress, connectedWallet]);

  // Check for existing WalletConnect session on mount
  useEffect(() => {
    const checkWalletConnectSession = async () => {
      try {
        const walletConnectProvider = new WalletConnectProvider(walletConnectConfig);
        if (walletConnectProvider.connected) {
          const web3Provider = new Web3Provider(walletConnectProvider);
          const accounts = await web3Provider.listAccounts();
          if (accounts.length > 0) {
            setEvmAddress(accounts[0]);
            setConnectedWallet('walletconnect');
            setProvider(web3Provider);
          }
        }
      } catch (error) {
        console.error('Error checking WalletConnect session:', error);
      }
    };
    
    checkWalletConnectSession();
  }, []);

  const isConnected = useMemo(
    () => !!evmAddress && !!connectedWallet,
    [evmAddress, connectedWallet]
  );
  
  // Clean up provider on unmount
  useEffect(() => {
    return () => {
      if (provider) {
        // Clean up any event listeners or connections
        provider.removeAllListeners();
      }
    };
  }, [provider]);
  
  const getWalletIcon = (walletId: string) => {
    switch (walletId) {
      case 'metamask':
        return (
          <img 
            src="/wallets/metamask.svg" 
            alt="MetaMask" 
            className="w-6 h-6" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzODQgNTEyIj48cGF0aCBmaWxsPSIjEUE4QzJCIiBkPSJMNDE4IDEwMS43NnYyODcuM0gyNTZWMjQ2LjY4YzAtNDkuNjgtMjAuNDItNzYuNjctNjUuOTItNzYuNjdjLTE3LjM0IDAtMzEuMjQgNS4xLTQxLjMgMTMuN1VxMDEuNzZjLTE5LjY2LTE0LjY4LTQyLjYtMjEuOTItNjguMjUtMjEuOTJjLTUyLjY2IDAtOTUuMzkgMjUuOC05NS4zOSA4NS4xN1VxMDBoODUuMjV2LTIxMy4wMWMwLTM1LjYgMTQuMjctNTUuOTkgNDguMTctNTUuOTljMjUuMTcgMCA0MS4wOCAxOS4yNCAxMS4wOCA0OS43N2MtOS4yMyAxMS44Mi0xNC41NSAyMS4zOC0xNC41NSAzMS4yN1VxMDBoODUuMjV2LTIxM2MwLTM1LjYgMTQuMjQtNTUuOTkgNDguMTctNTUuOTljMjUuMTcgMCA0MS4wOCAxOS4yNCAxMS4wOCA0OS43N2MtOS4yMyAxMS44Mi0xNC41NSAyMS4zOC0xNC41NSAzMS4yN1VxMDBoMzg0VjE4Ni45OGMwLTg1Ljg3LTQyLjY2LTEyNi4yMi05Ni4yNS0xMjYuMjJjLTQ0LjU4IDAtNzAuNTggMjUuOC04Mi45IDQzLjQ0eiIvPjwvc3ZnPg=='; 
            }}
          />
        );
      case 'coinbase':
        return (
          <img 
            src="/wallets/coinbase.svg" 
            alt="Coinbase Wallet" 
            className="w-6 h-6"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgNTAwIDUwMCI+PHBhdGggZmlsbD0iIzAwNTJGRiIgZD0iTTI1MCw1MEMxMzguMDcsNTAsNDgsMTQwLjA3LDQ4LDI1MlMxMzguMDcsNDU0LDI1MCw0NTRzMjAyLTkwLjA3LDIwMi0yMDJTMzYxLjkzLDUwLDI1MCw1MHogTTI1MCwzODZjLTc0LjQ0LDAtMTM0LjYtNjAuMTYtMTM0LjYtMTM0LjZTMTc1LjU2LDExNi44LDI1MCwxMTYuOHMxMzQuNiw2MC4xNiwxMzQuNiwxMzQuNlMzMjQuNDQsMzg2LDI1MCwzODZ6Ii8+PC9zdmc+';
            }}
          />
        );
      case 'walletconnect':
        return (
          <img 
            src="/wallets/walletconnect.svg" 
            alt="WalletConnect" 
            className="w-6 h-6"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgNTEyIDUxMiI+PHBhdGggZmlsbD0iIzNiM0I0QiIgZD0iTTEwNi4xIDIxNi41T0M2LjcgMTU3LjcgMCAxNDQuNSAwIDEyOGMwLTguOCAzLjUtMTcgMTAuNS0yMy45bDAtLjFDMjUuMSA4Ni4xIDY0IDY0IDEyOCA2NGM2My45IDAgMTAyLjkgMjIuMSAxMTcuNSAzOS45bC0xOS4zIDE5LjhDMy4yIDEyOC4yIDAgMTI4IDAgMTI4YzAgMTEuMSA1LjIgMjAuNCAxMy4xIDI2LjRsOTMuMSA2Mi4xYy0uMS4xLS4yLjItLjMuM2wtMTkuNyAxOS44Yy0xNi4yLTEyLjItNDUuNS0zNy4yLTk5LjctMzkuOHptMjk5LjggMGMyLTUuMiAzLjEtMTAuNSAzLjEtMTUuOCAwLTguOC0zLjUtMTctMTAuNS0yMy45bC0uMS0uMWMtMTguNi0xNi45LTU3LjYtMzktMTIxLjUtMzlDMjQxLjkgMTQ3IDIwMi45IDE2OS4xIDE4OC40IDE4N2wtMTkuMy0xOS44QzI0OC44IDE0Ny45IDI1NiAxMjggMjU2IDEyOGMwLTExLjEtNS4yLTIwLjQtMTMuMS0yNi40bC05My4xLTYyLjFjLjEtLjEuMi0uMi4zLS4zbDE5LjctMTkuOGMxNi4yIDEyLjIgNDUuNSAzNy4yIDk5LjcgMzkuOHpNNDkuNiAzMjQuN0w5LjcgMzY0LjZjLTEzLjEtMTMuMS0xMy4xLTM0LjIgMC00Ny4zbDQwLTQwYzEzLjEtMTMuMSAzNC4yLTEzLjEgNDcuMyAwbDQwIDQwYzEzLjEgMTMuMSAxMy4xIDM0LjIgMCA0Ny4zbC00MCA0MGMtMTMuMSAxMy4xLTM0LjIgMTMuMS00Ny4zIDBsLTQwLTQwYy0xMy4xLTEzLjEtMTMuMS0zNC4yIDAtNDcuM3ptNDEyLjgtMS40bC00MC00MGMtMTMuMS0xMy4xLTEzLjEtMzQuMiAwLTQ3LjNsNDAtNDBjMTMuMS0xMy4xIDM0LjItMTMuMSA0Ny4zIDBsNDAgNDBjMTMuMSAxMy4xIDEzLjEgMzQuMiAwIDQ3LjNsLTQwIDQwYy0xMy4xIDEzLjEtMzQuMiAxMy4xLTQ3LjMgMGwtNDAtNDBjLTEzLjEtMTMuMS0xMy4xLTM0LjIgMC00Ny4zek0yNTYgMzg0Yy0xMS4xIDAtMjAuNC01LjItMjYuNC0xMy4xbC02Mi4xLTkzLjFjLS4xLS4xLS4yLS4yLS4zLS4zbDE5LjgtMTkuOGMxMi4yIDE2LjIgMzcuMiA0NS41IDM5LjggOTkuN2gxOC45YzIuNS01NC4yIDI3LjUtODMuNSA0My43LTk5LjdMNDQzLjkgMzA5Yy01LjkgNy45LTE1LjIgMTMtMjYuNCAxM0gyNTZ6Ii8+PC9zdmc+';
            }}
          />
        );
      default:
        return <Wallet className="w-6 h-6" />;
    }
  };

  const renderConnectedState = () => (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              {getWalletIcon(connectedWallet || '')}
            </div>
            <div>
              <h3 className="text-sm font-medium">
                {connectedWallet === 'metamask' ? 'MetaMask Connected' : 
                 connectedWallet === 'coinbase' ? 'Coinbase Wallet Connected' : 
                 connectedWallet === 'walletconnect' ? 'WalletConnect Connected' : 'Wallet Connected'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {evmAddress ? formatAddress(evmAddress) : 'No address'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => {
                setConnectedWallet(null);
                setEvmAddress(null);
                logout();
              }}
            >
              Disconnect
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderWalletButton = (wallet: WalletOption) => (
    <Button
      key={wallet.id}
      variant="outline"
      className={`w-full justify-start gap-3 h-14 text-left transition-all ${
        isConnecting === wallet.id ? 'opacity-75' : ''
      } ${connectedWallet === wallet.id ? 'border-green-500' : ''}`}
      onClick={() => connectWallet(wallet.id)}
      disabled={isConnecting !== null}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
        {getWalletIcon(wallet.id)}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{wallet.name}</span>
          {wallet.popular && (
            <Badge variant="secondary" className="text-xs">
              Popular
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{wallet.description}</p>
      </div>
      {isConnecting === wallet.id ? (
        <div className="w-4 h-4 border-2 border-t-transparent border-primary rounded-full animate-spin" />
      ) : connectedWallet === wallet.id ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <ExternalLink className="w-4 h-4 text-muted-foreground" />
      )}
    </Button>
  );

  if (isConnected) {
    return renderConnectedState();
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <Wallet className="h-12 w-12 text-blue-600 mx-auto" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {mode === "login"
            ? "Connect your wallet to sign in securely"
            : "Connect your wallet to create your account"}
        </p>
      </div>

      <div className="space-y-3">
        {walletOptions.map((wallet) => (
          <div key={wallet.id}>
            {renderWalletButton(wallet)}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-300">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium">New to crypto wallets?</p>
            <p className="mt-1">
              We recommend starting with MetaMask. It's secure, easy to use, and
              works with most devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
