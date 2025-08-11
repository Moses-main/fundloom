// // components/Header.tsx

// import React from "react";
// import { CheckCircle, Heart } from "lucide-react";

// interface HeaderProps {
//   walletConnected: boolean;
//   userAddress: string;
//   connectWallet: () => void;
//   disconnectWallet: () => void;
//   activeTab: string;
//   setActiveTab: (tab: string) => void;
// }

// export const Header: React.FC<HeaderProps> = ({
//   walletConnected,
//   userAddress,
//   connectWallet,
//   disconnectWallet,
//   activeTab,
//   setActiveTab,
// }) => {
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
//                 onClick={() => setActiveTab(tab)}
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
//                   className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all"
//                 >
//                   Disconnect
//                 </button>
//               </div>
//             ) : (
//               <button
//                 onClick={connectWallet}
//                 className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
//               >
//                 <span>Connect Wallet</span>
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// // "use client";
// import "../global.css";
import "../App.css";
import { useState } from "react";
import { Link } from "react-router-dom"; // React Router Link
import { Button } from "../components/ui/Button";
import { ThemeToggle } from "../components/theme-toggle";
import { Menu, X, Zap } from "lucide-react";

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-mono text-xl font-bold">FundFlow</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
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
        </nav>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              {/* Use React Router Link with `to` */}
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
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button className="w-full" onClick={() => setIsMenuOpen(false)}>
                  Create
                </Button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
