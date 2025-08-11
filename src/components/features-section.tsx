import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import {
  Wallet,
  CreditCard,
  Share2,
  Shield,
  Globe,
  Zap,
  Users,
  BarChart3,
  Lock,
} from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Multiple Payment Options",
    description:
      "Accept donations via crypto wallets, credit cards, PayPal, and more. Your supporters choose what works best for them.",
  },
  {
    icon: Share2,
    title: "Easy Campaign Sharing",
    description:
      "Generate shareable links for your campaigns. Share across social media, email, or embed on your website.",
  },
  {
    icon: Shield,
    title: "Decentralized & Secure",
    description:
      "Built on blockchain technology ensuring transparency, security, and immutable transaction records.",
  },
  {
    icon: Globe,
    title: "Global Accessibility",
    description:
      "Reach supporters worldwide with multi-currency support and localized payment methods.",
  },
  {
    icon: Zap,
    title: "Instant Transfers",
    description:
      "Receive funds instantly with low transaction fees. No waiting periods or complex withdrawal processes.",
  },
  {
    icon: Users,
    title: "Community Building",
    description:
      "Engage with your supporters through updates, comments, and milestone celebrations.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Track your campaign performance with detailed analytics and insights about your supporters.",
  },
  {
    icon: Lock,
    title: "Smart Contracts",
    description:
      "Automated fund distribution based on predefined milestones and conditions for added trust.",
  },
  {
    icon: CreditCard,
    title: "No Hidden Fees",
    description:
      "Transparent pricing with competitive rates. What you see is what you pay - no surprises.",
  },
];

export function FeaturesSection() {
  // Teal edge accents + neutral card background (aligned with dashboard)
  const barColors = [
    "bg-teal-500/50",
    "bg-teal-600/50",
    "bg-teal-400/60",
    "bg-teal-500/40",
    "bg-teal-600/40",
  ];
  const shapes = [
    "rounded-3xl",
    "rounded-[1.75rem]",
    "rounded-tl-3xl rounded-br-3xl rounded-tr-xl rounded-bl-xl",
    "rounded-2xl",
    "rounded-xl",
  ];

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Everything You Need to{" "}
            <span className="font-mono text-primary">Succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to make crowdfunding accessible, secure,
            and effective for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10 lg:gap-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const bar = barColors[index % barColors.length];
            const rounded = shapes[index % shapes.length];
            return (
              <Card
                key={index}
                className={`relative overflow-hidden ${rounded} border-0 dark:border border-border bg-card shadow-[0_8px_24px_#aaa] hover:shadow-none transition-all duration-300 animate-fade-in-up hover:-translate-y-1 hover:border hover:border-gray-300 will-change-transform min-h-56`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Top teal accent bar */}
                <div className={`absolute inset-x-0 top-0 h-1.5 ${bar}`} />
                {/* Decorative solid dot */}
                <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-teal-500/10" />

                <CardHeader className="pb-2">
                  <div className="flex items-center gap-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-200/30">
                      <Icon className="h-7 w-7 text-teal-700" />
                    </div>
                    <CardTitle className="text-2xl font-semibold">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 pb-8">
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
