import "../App.css";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ThemeToggle } from "../components/theme-toggle";
import { Menu, X, Zap } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "@/context/AuthContext";

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const { activeTab, setActiveTab } = useAppContext();
  const { isAuthenticated: isAuthed, logout } = useAuth();
  const [evmAddress, setEvmAddress] = useState<string | null>(null);

  useEffect(() => {
    const eth = (window as { ethereum?: { request?: (args: { method: string }) => Promise<string[]>; on?: (event: string, handler: (accounts: string[]) => void) => void; removeListener?: (event: string, handler: (accounts: string[]) => void) => void; } }).ethereum;
    if (!eth) return;

    const update = async () => {
      try {
        const accounts: string[] = (await eth.request?.({ method: "eth_accounts" })) || [];
        setEvmAddress(accounts && accounts.length ? accounts[0] : null);
      } catch {
        setEvmAddress(null);
      }
    };

    update();
    const handler = (accounts: string[]) => setEvmAddress(accounts && accounts.length ? accounts[0] : null);
    eth.on?.("accountsChanged", handler);
    return () => eth.removeListener?.("accountsChanged", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setEvmAddress(null);
    setIsMenuOpen(false);
    navigate("/");
  };

  const dashboardTabs: Array<"overview" | "donated" | "profile" | "campaigns" | "wallet"> = [
    "overview",
    "donated",
    "profile",
    "campaigns",
    "wallet",
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="text-lg font-semibold">FundLoom</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {isDashboard &&
            dashboardTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  navigate(`/dashboard?tab=${tab}`);
                }}
                className={`rounded-md px-3 py-2 text-sm capitalize transition-colors ${
                  activeTab === tab ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                {tab}
              </button>
            ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {isDashboard && (isAuthed || evmAddress) ? (
            <>
              <span className="rounded-md border bg-muted/40 px-3 py-1.5 text-xs font-medium">
                {evmAddress ? `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}` : "Connected"}
              </span>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Start process</Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle navigation menu"
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t bg-background px-4 py-3 md:hidden">
          {isDashboard ? (
            <div className="space-y-1">
              {dashboardTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    navigate(`/dashboard?tab=${tab}`);
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full rounded-md px-3 py-2 text-left text-sm capitalize ${
                    activeTab === tab ? "bg-muted" : "text-muted-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
              <div className="pt-2">
                {(isAuthed || evmAddress) ? (
                  <Button className="w-full" variant="outline" onClick={handleLogout}>Logout</Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>Start process</Link>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Link to="/campaigns" className="block rounded-md px-3 py-2 text-sm" onClick={() => setIsMenuOpen(false)}>
                Campaigns
              </Link>
              <Link to="/auth" className="block rounded-md px-3 py-2 text-sm" onClick={() => setIsMenuOpen(false)}>
                Sign in
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
