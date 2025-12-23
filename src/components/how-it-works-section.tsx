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
    "bg-indigo-500/80",
    "bg-purple-600/80",
    "bg-indigo-400/80",
    "bg-purple-500/80",
  ];
  const shapes = [
    "rounded-3xl",
    "rounded-[1.75rem]",
    "rounded-tl-3xl rounded-br-3xl rounded-tr-xl rounded-bl-xl",
    "rounded-2xl",
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-gray-900 dark:text-white">
            How <span className="font-mono text-indigo-600 dark:text-indigo-400">Fundloom</span> Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
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
                className={`relative overflow-hidden ${rounded} border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up hover:-translate-y-1 hover:border-indigo-200 dark:hover:border-indigo-400 min-h-56`}
                style={{ animationDelay: `${index * 90}ms` }}
              >
                {/* Top teal accent bar */}
                <div className={`absolute inset-x-0 top-0 h-1 ${bar}`} />

                <CardHeader className="text-center pb-6">
                  <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-500/20">
                    <Icon className="h-9 w-9 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="absolute -top-4 -right-4 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-full  blur-sm opacity-70" />
                      <div className="relative flex h-10 w-10 items-center mt-10 mr-10 justify-center rounded-full bg-indigo-600 dark:bg-indigo-500 text-white text-base font-extrabold font-mono ring-4 ring-white/70 dark:ring-gray-800/70 shadow-md">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="text-center space-y-4">
                  <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {step.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
                    {step.description}
                  </CardDescription>
                  <Button variant="outline" size="sm" className="mt-1 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300">
                    {step.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Button size="lg" className="text-lg px-8 py-6 cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300">
            Start Your First Campaign
          </Button>
        </div>
      </div>
    </section>
  );
}
