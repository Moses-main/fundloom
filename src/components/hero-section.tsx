import { Button } from "../components/ui/Button";
import {
  ArrowRight,
  Play,
  Users,
  DollarSign,
  Shield,
  Sparkles,
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: Text + CTA */}
          <div className="text-center lg:text-left">
            <div className="mb-6 flex justify-center lg:justify-start animate-fade-in-up">
              <div className="flex items-center space-x-2 rounded-full border bg-background/80 backdrop-blur-sm px-4 py-2 text-sm shadow-lg">
                <Sparkles className="h-4 w-4 text-teal-600 animate-pulse" />
                <span className="font-medium">
                  Decentralized • Secure • For Everyone
                </span>
              </div>
            </div>

            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl animate-fade-in-up">
              Fund the Future,
              <span className="text-teal-700"> Empower Dreams</span>
            </h1>

            <p className="mb-8 text-lg sm:text-xl text-muted-foreground max-w-2xl lg:max-w-none lg:pr-6 leading-relaxed animate-fade-in-up">
              Create campaigns and receive support through multiple payment
              methods. Built for crypto enthusiasts and everyday supporters
              alike.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center lg:justify-start animate-fade-in-up">
              <Button
                size="lg"
                asChild
                className="text-base sm:text-lg px-7 py-5 shadow-lg hover:shadow-xl transition-all"
              >
                <a href="/auth?mode=signup">
                  Start Your Campaign
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base sm:text-lg px-7 py-5 bg-background/80 backdrop-blur-sm border-2 hover:bg-background/90"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-3 max-w-lg mx-auto lg:mx-0 animate-fade-in-up">
              <div className="text-center p-3 rounded-lg bg-background/60 backdrop-blur-sm border">
                <div className="text-teal-700 text-2xl font-bold font-mono">
                  10K+
                </div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-background/60 backdrop-blur-sm border">
                <div className="text-teal-700 text-2xl font-bold font-mono">
                  $2M+
                </div>
                <div className="text-xs text-muted-foreground">Raised</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-background/60 backdrop-blur-sm border">
                <div className="text-teal-700 text-2xl font-bold font-mono">
                  100%
                </div>
                <div className="text-xs text-muted-foreground">Secure</div>
              </div>
            </div>
          </div>

          {/* Right: Large icon mosaic */}
          <div className="hidden lg:block">
            <div className="relative mx-auto w-full max-w-xl aspect-square">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-[2rem] border border-teal-200/60" />
              {/* Icon grid */}
              <div className="grid grid-cols-3 gap-4 h-full p-6">
                <div className="flex items-center justify-center rounded-2xl bg-teal-50">
                  <Users className="h-16 w-16 text-teal-700" />
                </div>
                <div className="flex items-center justify-center rounded-2xl bg-teal-100">
                  <DollarSign className="h-16 w-16 text-teal-700" />
                </div>
                <div className="flex items-center justify-center rounded-2xl bg-teal-50">
                  <Shield className="h-16 w-16 text-teal-700" />
                </div>
                <div className="flex items-center justify-center rounded-2xl bg-teal-100">
                  <Users className="h-16 w-16 text-teal-700" />
                </div>
                <div className="flex items-center justify-center rounded-2xl bg-teal-50">
                  <DollarSign className="h-16 w-16 text-teal-700" />
                </div>
                <div className="flex items-center justify-center rounded-2xl bg-teal-100">
                  <Shield className="h-16 w-16 text-teal-700" />
                </div>
                <div className="flex items-center justify-center rounded-2xl bg-teal-50">
                  <Users className="h-16 w-16 text-teal-700" />
                </div>
                <div className="flex items-center justify-center rounded-2xl bg-teal-100">
                  <DollarSign className="h-16 w-16 text-teal-700" />
                </div>
                <div className="flex items-center justify-center rounded-2xl bg-teal-50">
                  <Shield className="h-16 w-16 text-teal-700" />
                </div>
              </div>
              {/* Glow */}
              <div className="pointer-events-none absolute -inset-4 rounded-[2.5rem] ring-1 ring-teal-500/30" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
