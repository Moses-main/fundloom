import { ArrowRight, Shield, Wallet, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const metrics = [
  { label: "Supported rails", value: "Crypto + Fiat" },
  { label: "Target networks", value: "Base / Sepolia" },
  { label: "Design goal", value: "Transparent funding" },
];

export function HeroSection() {
  return (
    <section className="animate-in fade-in-0 duration-500 border-b bg-gradient-to-b from-background to-muted/40">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 lg:px-8">
        <div className="space-y-6">
          <p className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            FundLoom · Decentralized fundraising
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Raise and receive contributions with a cleaner onchain workflow.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            FundLoom helps creators launch transparent campaigns, accept crypto on Base, and support hybrid payment experiences without heavy operational overhead.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="/auth?mode=signup">
                Launch a Campaign
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/campaigns">Explore Campaigns</a>
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border bg-background p-4">
              <Wallet className="mb-3 h-5 w-5 text-primary" />
              <p className="text-sm font-medium">Wallet-first identity</p>
              <p className="mt-1 text-sm text-muted-foreground">Sign-in designed for web3 users and campaign operators.</p>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <Shield className="mb-3 h-5 w-5 text-primary" />
              <p className="text-sm font-medium">Trust by default</p>
              <p className="mt-1 text-sm text-muted-foreground">Structured around transparent transactions and clear campaign ownership.</p>
            </div>
            <div className="rounded-xl border bg-background p-4 sm:col-span-2">
              <Globe2 className="mb-3 h-5 w-5 text-primary" />
              <p className="text-sm font-medium">Built for global communities</p>
              <p className="mt-1 text-sm text-muted-foreground">Support donors across crypto and fiat channels while keeping the UX simple.</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="text-sm font-medium">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
