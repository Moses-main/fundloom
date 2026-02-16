import { Banknote, HandCoins, ShieldCheck, Users } from "lucide-react";

const features = [
  {
    icon: HandCoins,
    title: "Campaign-first flow",
    description:
      "Set up fundraising pages focused on goals, updates, and donor confidence.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent contribution model",
    description:
      "Keep donor trust high with clear raised totals, milestones, and payment records.",
  },
  {
    icon: Banknote,
    title: "Crypto + fiat pathways",
    description:
      "Support onchain donations while progressively enabling compliant fiat channels.",
  },
  {
    icon: Users,
    title: "Community participation",
    description:
      "Encourage repeat support through campaign updates, comments, and social sharing.",
  },
];

export function FeaturesSection() {
  return (
    <section className="animate-in fade-in-0 duration-500 border-b bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">A mature foundation for modern fundraising</h2>
          <p className="mt-3 text-muted-foreground">
            We removed decorative noise and focused the product around campaign credibility, contribution clarity, and streamlined donor actions.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="rounded-xl border bg-card p-5 shadow-sm">
                <Icon className="mb-3 h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
