// // "use client";
// import "../global.css";
import "../App.css";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // React Router Link
import { Button } from "../components/ui/Button";
import { ThemeToggle } from "../components/theme-toggle";
import { Menu, X, Zap, Wallet, CheckCircle } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { clearAuth } from "../lib/api";

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const {
    activeTab,
    setActiveTab,
    walletConnected,
    connectWallet,
    disconnectWallet,
    userAddress,
  } = useAppContext();

  // Determine if user is authenticated
  const [isAuthed, setIsAuthed] = useState(false);
  const [hasJwt, setHasJwt] = useState(false);
  useEffect(() => {
    try {
      const token = localStorage.getItem("auth_token");
      const tokenPresent = !!token;
      setHasJwt(tokenPresent);
      setIsAuthed(tokenPresent || walletConnected);
    } catch {
      setIsAuthed(walletConnected);
    }
  }, [walletConnected, location.pathname]);

  const handleLogout = () => {
    clearAuth();
    setHasJwt(false);
    setIsAuthed(!!walletConnected);
    // Navigate home and close menus
    navigate("/");
    setIsMenuOpen(false);
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
        <nav className="hidden md:flex items-center space-x-2">
          {isDashboard ? (
            <div className="flex items-center gap-2">
              {["campaigns", "donate", "charity", "profile"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${
                      activeTab === tab
                        ? "bg-muted text-foreground"
                        : "hover:bg-muted/60 text-muted-foreground"
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          ) : (
            <>
              <a
                href="#features"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                How It Works
              </a>
              <a
                href="#campaigns"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Campaigns
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Pricing
              </a>
            </>
          )}
        </nav>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <div className="hidden md:flex items-center space-x-2">
            {isDashboard ? (
              walletConnected ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-foreground">
                      {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={disconnectWallet}>
                    Disconnect
                  </Button>
                  {hasJwt && (
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      Logout
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={connectWallet}>
                    <Wallet className="h-4 w-4 mr-2" /> Connect Wallet
                  </Button>
                  {hasJwt && (
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      Logout
                    </Button>
                  )}
                </div>
              )
            ) : (
              <>
                {isAuthed ? (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/profile">Profile</Link>
                    </Button>
                    {hasJwt && (
                      <Button variant="ghost" size="sm" onClick={handleLogout}>
                        Logout
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
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

      {/* Mobile Navigation */}
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
                <span className="text-sm font-medium text-muted-foreground">
                  Menu
                </span>
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
                  {["campaigns", "donate", "charity", "profile"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab as any);
                        setIsMenuOpen(false);
                      }}
                      className={`block w-full text-left rounded-lg px-4 py-3 text-base font-medium hover:bg-muted/50 ${
                        activeTab === tab ? "bg-muted/60" : ""
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                  <div className="pt-2 grid grid-cols-1 gap-2">
                    {walletConnected ? (
                      <Button variant="outline" className="w-full" onClick={() => { disconnectWallet(); setIsMenuOpen(false); }}>
                        Disconnect ({userAddress.slice(0, 6)}...{userAddress.slice(-4)})
                      </Button>
                    ) : (
                      <Button className="w-full" onClick={() => { connectWallet(); setIsMenuOpen(false); }}>
                        <Wallet className="h-4 w-4 mr-2" /> Connect Wallet
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <a
                    href="#features"
                    className="block rounded-lg px-4 py-3 text-base font-medium hover:bg-muted/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Features
                  </a>
                  <a
                    href="#how-it-works"
                    className="block rounded-lg px-4 py-3 text-base font-medium hover:bg-muted/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    How It Works
                  </a>
                  <a
                    href="#campaigns"
                    className="block rounded-lg px-4 py-3 text-base font-medium hover:bg-muted/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Campaigns
                  </a>
                  <a
                    href="#pricing"
                    className="block rounded-lg px-4 py-3 text-base font-medium hover:bg-muted/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pricing
                  </a>
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    {isAuthed ? (
                      <>
                        <Button className="w-full" asChild onClick={() => setIsMenuOpen(false)}>
                          <Link to="/profile">Profile</Link>
                        </Button>
                        {hasJwt ? (
                          <Button variant="outline" className="w-full" onClick={handleLogout}>
                            Logout
                          </Button>
                        ) : (
                          <Button variant="outline" className="w-full" onClick={connectWallet}>
                            Connect Wallet
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
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

// src / components / Header.tsx;

// import React from "react";
// import { Heart, Wallet, CheckCircle } from "lucide-react";
// import { useAppContext } from "../context/AppContext";

// export const Header: React.FC = () => {
//   const {
//     activeTab,
//     setActiveTab,
//     walletConnected,
//     connectWallet,
//     disconnectWallet,
//     userAddress,
//   } = useAppContext();

//   return (
//     <header className="bg-white shadow-lg border-b border-gray-200">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center py-4">
//           <div className="flex items-center space-x-3">
//             <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
//               <Heart className="h-8 w-8 text-white" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">CharityChain</h1>
//               <p className="text-sm text-gray-600">
//                 Transparent Giving, Verified Impact
//               </p>
//             </div>
//           </div>

//           <nav className="hidden md:flex space-x-8">
//             {["campaigns", "donate", "charity", "profile"].map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab as any)}
//                 className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
//                   activeTab === tab
//                     ? "bg-blue-100 text-blue-700 shadow-sm"
//                     : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
//                 }`}
//               >
//                 {tab.charAt(0).toUpperCase() + tab.slice(1)}
//               </button>
//             ))}
//           </nav>

//           <div className="flex items-center space-x-4">
//             {walletConnected ? (
//               <div className="flex items-center space-x-3">
//                 <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
//                   <CheckCircle className="h-4 w-4 text-green-600" />
//                   <span className="text-sm font-medium text-green-800">
//                     {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
//                   </span>
//                 </div>
//                 <button
//                   onClick={disconnectWallet}
//                   className="text-sm text-gray-600 hover:text-gray-900"
//                 >
//                   Disconnect
//                 </button>
//               </div>
//             ) : (
//               <button
//                 onClick={connectWallet}
//                 className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
//               >
//                 <Wallet className="h-4 w-4" />
//                 <span>Connect Wallet</span>
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// // export default Header;
