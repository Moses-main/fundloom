import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="text-lg font-semibold">FundLoom</span>
          </Link>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Decentralized fundraising for transparent campaign execution and trusted community support.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <Link to="/campaigns" className="hover:text-foreground">Campaigns</Link>
          <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <Link to="/auth" className="hover:text-foreground">Sign in</Link>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          © {new Date().getFullYear()} FundLoom. Built for modern, transparent fundraising.
        </div>
      </div>
    </footer>
  );
};
