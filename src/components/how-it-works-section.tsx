import { FileText, Wallet, BarChart3 } from "lucide-react";

const steps = [
  {
    title: "Create a focused campaign",
    description:
      "Define your goal, funding target, and why the campaign matters in clear language.",
    icon: FileText,
  },
  {
    title: "Collect contributions",
    description:
      "Receive support through wallet-driven flows today, with fiat rails layered in where needed.",
    icon: Wallet,
  },
  {
    title: "Report progress",
    description:
      "Share outcomes, updates, and milestones to maintain supporter trust over time.",
    icon: BarChart3,
  },
];

export function HowItWorksSection() {
  return (
    <section className="animate-in fade-in-0 duration-500 border-b bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How FundLoom works</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            A practical three-step flow designed for creators and contributors, without unnecessary complexity.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="rounded-xl border bg-background p-6 shadow-sm">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Step {index + 1}</p>
                <Icon className="mb-3 h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
