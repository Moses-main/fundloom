import React from "react";

const FeaturePage: React.FC = () => {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <section className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">About FundLoom</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          FundLoom enables transparent, community-driven fundraising. Explore campaigns, donate as a guest, or create your own.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Highlights</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>Guest donations without wallet connection</li>
            <li>Multi-step, guided campaign creation</li>
            <li>Real-time progress with transparent stats</li>
            <li>Modern, mobile-first UI</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">For Donors</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Discover and support causes that matter. Donate via crypto (if connected) or simulated card/bank/mobile options for demo purposes.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">For Creators</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Start a campaign in minutes. Share widely, track donations, and keep your supporters updated.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Roadmap</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>Deeper analytics and donor insights</li>
            <li>Improved payout options</li>
            <li>Stronger identity and verification flows</li>
          </ul>
        </div>
      </div>
    </main>
  );
};

export default FeaturePage;
