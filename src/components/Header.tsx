// // "use client";
// import "../global.css";
import "../App.css";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // React Router Link
import { Button } from "../components/ui/Button";
import { ThemeToggle } from "../components/theme-toggle";
import { Menu, X, Zap, CheckCircle } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { WalletConnectorModal } from "../components/modal/WalletConnector";
import { useAuth } from "@/context/AuthContext";

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const { activeTab, setActiveTab } = useAppContext();
  // Address for display only
  const { address: starknetAddress } = useAccount();
  const { disconnect: starknetDisconnect } = useDisconnect();
  const {
    isAuthenticated: isAuthed,
    hasJwt,
    walletConnected,
    logout,
  } = useAuth();
  // Detect EVM wallet (MetaMask) connection
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  useEffect(() => {
    const eth = (window as any)?.ethereum;
    if (!eth) return;
    const update = async () => {
      try {
        const accounts: string[] = await eth.request?.({
          method: "eth_accounts",
        });
        setEvmAddress(accounts && accounts.length ? accounts[0] : null);
      } catch {}
    };
    update();
    const handler = (accounts: string[]) =>
      setEvmAddress(accounts && accounts.length ? accounts[0] : null);
    eth.on?.("accountsChanged", handler);
    return () => {
      eth.removeListener?.("accountsChanged", handler);
    };
  }, []);
  // When user clicks logout or disconnect, call unified logout
  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };
  const handleDisconnectWallet = async () => {
    try {
      if (starknetAddress) {
        await starknetDisconnect();
      }
    } catch {}
    // MetaMask/Coinbase cannot be force-disconnected; clear local state only
    setEvmAddress(null);
    setIsMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-mono text-xl font-bold">FundLoom</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
          {isDashboard ? (
            <div className="flex items-center gap-2">
              {(["overview", "donated", "profile", "campaigns", "wallet"] as const).map((tab) => {
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab as any);
                      navigate(`/dashboard?tab=${tab}`);
                    }}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${
                        activeTab === tab
                          ? "bg-muted text-foreground"
                          : "hover:bg-muted/60 text-muted-foreground"
                      }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              <Link
                to="/"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                to="/docs/api"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                API Docs
              </Link>
              <Link
                to="/docs/protocol"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Protocol
              </Link>
              <Link
                to="/feature"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Feature Page
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center space-x-3 lg:space-x-4">
          <ThemeToggle />
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {isDashboard ? (
              <div className="flex items-center gap-2">
                {walletConnected && (
                  <>
                    <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-foreground">
                        {(starknetAddress || evmAddress)?.slice(0, 6)}...
                        {(starknetAddress || evmAddress)?.slice(-4)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDisconnectWallet}
                    >
                      Disconnect
                    </Button>
                  </>
                )}
                {hasJwt && (
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                )}
                {!walletConnected && !hasJwt && !isAuthed && (
                  <WalletConnectorModal />
                )}
              </div>
            ) : (
              <>
                {hasJwt ? (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/profile">Profile</Link>
                    </Button>
                    {walletConnected && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDisconnectWallet}
                      >
                        Disconnect
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                ) : (
                  <>
                    {walletConnected && (
                      <></>
                      // <Button
                      //   variant="ghost"
                      //   size="sm"
                      //   onClick={handleDisconnectWallet}
                      // >
                      //   Disconnect
                      // </Button>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        to="/auth"
                        className="text-sm font-medium hover:text-primary transition-colors"
                      >
                        Sign In
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to="/auth?mode=signup">Create Campaign</Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        >
          <nav
            id="mobile-nav"
            className="absolute inset-x-0 top-16 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <div
              className="rounded-2xl border bg-background/95 shadow-lg p-4 space-y-1"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-2 pb-2">
                <span className="text-sm font-medium text-muted-foreground">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close menu"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              {isDashboard ? (
                <>
                  {["overview", "donated", "profile", "campaigns", "wallet"].map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => {
                          setActiveTab(tab as any);
                          navigate(`/dashboard?tab=${tab}`);
                          setIsMenuOpen(false);
                        }}
                        className={`block w-full text-left rounded-lg px-4 py-3 text-base font-medium hover:bg-muted/50 ${
                          activeTab === (tab as any) ? "bg-muted/60" : ""
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    )
                  )}
                  <div className="pt-2 grid grid-cols-1 gap-2">
                    {walletConnected && (
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleDisconnectWallet();
                        }}
                      >
                        Disconnect Wallet
                      </Button>
                    )}
                    {hasJwt && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                      >
                        Logout
                      </Button>
                    )}
                    {!walletConnected && !hasJwt && !isAuthed && (
                      <div className="w-full">
                        <WalletConnectorModal />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/docs/api"
                    className="block rounded-lg px-4 py-3 text-base font-medium hover:bg-muted/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    API Docs
                  </Link>
                  <Link
                    to="/docs/protocol"
                    className="block rounded-lg px-4 py-3 text-base font-medium hover:bg-muted/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Protocol
                  </Link>
                  <Link
                    to="/feature"
                    className="block rounded-lg px-4 py-3 text-base font-medium hover:bg-muted/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Feature Page
                  </Link>
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    {hasJwt ? (
                      <>
                        <Button className="w-full" asChild onClick={() => setIsMenuOpen(false)}>
                          <Link to="/profile">Profile</Link>
                        </Button>
                        {walletConnected && (
                          <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => {
                              setIsMenuOpen(false);
                              handleDisconnectWallet();
                            }}
                          >
                            Disconnect Wallet
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleLogout();
                          }}
                        >
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        {walletConnected && (
                          <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => {
                              setIsMenuOpen(false);
                              handleDisconnectWallet();
                            }}
                          >
                            Disconnect Wallet
                          </Button>
                        )}
                        <Button variant="outline" className="w-full" asChild>
                          <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                            Sign In
                          </Link>
                        </Button>
                        <Button className="w-full" asChild onClick={() => setIsMenuOpen(false)}>
                          <Link to="/auth?mode=signup">Create</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
