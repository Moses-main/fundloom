import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Timer, Layers, Database, ShieldCheck, Users, Award, Activity, Vote } from "lucide-react";
import React from "react";

const protocolFeatures = [
  {
    icon: Timer,
    title: "Rounds & Matching Pools",
    description:
      "Time-boxed funding rounds with sponsor-backed matching pools to amplify community donations.",
    detail:
      "Run recurring or seasonal rounds. Sponsors add matching funds; projects compete for matching via QF.",
  },
  {
    icon: Layers,
    title: "Quadratic Funding (QF)",
    description:
      "Many small donors > few whales. Matching computed off-chain, verified on-chain for fairness.",
    detail:
      "Off-chain calculators publish proofs; on-chain contracts verify results before disbursing matches.",
  },
  {
    icon: Database,
    title: "Project Registry",
    description:
      "On-chain registry with decentralized metadata via IPFS/Arweave for durability and openness.",
    detail:
      "Creators publish project descriptors; updates are versioned with content-addressed storage.",
  },
  {
    icon: ShieldCheck,
    title: "Sybil Resistance",
    description:
      "Pluggable verifiers like Gitcoin Passport, BrightID, World ID, ENS, POAPs to reduce fraud.",
    detail:
      "Rounds can require minimum scores or badges; verifiers are modular and opt-in per round.",
  },
  {
    icon: Users,
    title: "Community Curation",
    description:
      "Allowlists, tokenholder voting, reviewer councils to keep quality high and coordinate discovery.",
    detail:
      "Curators propose allowlists; token-weighted votes or councils approve projects for a round.",
  },
  {
    icon: Award,
    title: "Donor Incentives & Reputation",
    description:
      "NFTs/Soulbound badges, points, and leaderboards to reward impactful participation.",
    detail:
      "Mint badges for contributions, accrue reputation points, and climb community leaderboards.",
  },
  {
    icon: Activity,
    title: "Transparency & Audits",
    description:
      "Real-time donation feed, explorer links, and CSV exports for public auditing.",
    detail:
      "Every transfer is traceable with on-chain refs; export data for offline analysis.",
  },
  {
    icon: Vote,
    title: "Governance",
    description:
      "DAO controls round creation, parameters, dispute windows, and fees.",
    detail:
      "On-chain proposals configure rounds; emergency pauses and dispute resolution are built in.",
  },
];

export function ProtocolSections() {
  return (
    <section id="protocol" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Protocol: Public Goods at Scale</h2>
          <p className="text-lg text-muted-foreground mt-3">
            Built-in primitives for fair matching, sybil resistance, and community governance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10 lg:gap-12">
          {protocolFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={i} className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-teal-200/30 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-teal-700" />
                    </div>
                    <CardTitle className="text-xl">{f.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {f.description}
                  </CardDescription>
                  <div className="mt-3 text-sm text-muted-foreground">
                    {f.detail}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
