import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  FiPlusCircle,
  FiShare2,
  FiDollarSign,
  FiTrendingUp,
} from "react-icons/fi";

const steps = [
  {
    icon: FiPlusCircle,
    title: "Create Your Campaign",
    description:
      "Set up your campaign with compelling content, funding goals, and timeline. Add images, videos, and detailed descriptions.",
    action: "Get Started",
  },
  {
    icon: FiShare2,
    title: "Share & Promote",
    description:
      "Get a unique campaign link to share across social media, email, and websites. Reach your network and beyond.",
    action: "Learn More",
  },
  {
    icon: FiDollarSign,
    title: "Receive Donations",
    description:
      "Accept payments through multiple channels - crypto wallets, credit cards, PayPal, and other payment methods.",
    action: "View Options",
  },
  {
    icon: FiTrendingUp,
    title: "Track & Grow",
    description:
      "Monitor your progress with real-time analytics, engage with supporters, and celebrate milestones together.",
    action: "See Analytics",
  },
];

export function HowItWorksSection() {
  const barColors = [
    "bg-teal-500/50",
    "bg-teal-600/50",
    "bg-teal-400/60",
    "bg-teal-500/40",
  ];
  const shapes = [
    "rounded-3xl",
    "rounded-[1.75rem]",
    "rounded-tl-3xl rounded-br-3xl rounded-tr-xl rounded-bl-xl",
    "rounded-2xl",
  ];

  return (
    <section id="how-it-works" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            How <span className="font-mono text-primary">Fundloom</span> Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Launch your campaign in minutes and start receiving support from a
            global community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const bar = barColors[index % barColors.length];
            const rounded = shapes[index % shapes.length];
            return (
              <Card
                key={index}
                className={`relative overflow-hidden ${rounded} border-0 dark:border border-border bg-card shadow-[0_8px_24px_#aaa] hover:shadow-none transition-all duration-300 animate-fade-in-up hover:-translate-y-1 hover:border hover:border-gray-300 min-h-56`}
                style={{ animationDelay: `${index * 90}ms` }}
              >
                {/* Top teal accent bar */}
                <div className={`absolute inset-x-0 top-0 h-1.5 ${bar}`} />

                <CardHeader className="text-center pb-6">
                  <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-2xl bg-teal-200/30">
                    <Icon className="h-9 w-9 text-teal-700" />
                  </div>
                  <div className="absolute -top-4 -right-4 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-full  blur-sm opacity-70" />
                      <div className="relative flex h-10 w-10 items-center mt-10 mr-10 justify-center rounded-full bg-teal-600 text-white text-base font-extrabold font-mono ring-4 ring-white/70 shadow-md">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="text-center space-y-4">
                  <CardTitle className="text-2xl font-semibold">
                    {step.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {step.description}
                  </CardDescription>
                  <Button variant="outline" size="sm" className="mt-1">
                    {step.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Button size="lg" className="text-lg px-8 py-6 cursor-pointer">
            Start Your First Campaign
          </Button>
        </div>
      </div>
    </section>
  );
}
