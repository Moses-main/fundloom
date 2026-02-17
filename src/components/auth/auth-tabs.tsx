"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { WalletAuthForm } from "./wallet-auth-form";
import { Button } from "@/components/ui/Button";
import { Mail, Sparkles, UserCircle2, Wallet } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useAuth } from "@/context/AuthContext";
import type { PrivyLoginMethod } from "@/lib/privyRuntime";

interface AuthTabsProps {
  initialMode?: "login" | "signup";
}

type AuthMethod = "wallet" | "social" | "email";

export function AuthTabs({ initialMode = "login" }: AuthTabsProps) {
  const [authMode, setAuthMode] = useState<"login" | "signup">(initialMode);
  const [activeTab, setActiveTab] = useState<AuthMethod>("wallet");
  const [loadingMethod, setLoadingMethod] = useState<AuthMethod | null>(null);
  const { show: toast } = useToast();
  const { loginWithPrivy } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const next = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("next") || "/dashboard";
  }, [location.search]);

  useEffect(() => {
    setAuthMode(initialMode);
  }, [initialMode]);

  const subtitle = useMemo(() => {
    return authMode === "login"
      ? "Continue with Privy authentication using wallet, social, or email"
      : "Create your campaign account securely with Privy";
  }, [authMode]);

  const handlePrivyLogin = async (method: PrivyLoginMethod, source: AuthMethod) => {
    setLoadingMethod(source);
    try {
      await loginWithPrivy(method);
      toast({
        type: "success",
        title: "Authenticated",
        description: "Successfully signed in with Privy.",
      });
      navigate(next, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Privy authentication failed.";
      toast({ type: "error", title: "Authentication failed", description: message });
    } finally {
      setLoadingMethod(null);
    }
  };

  return (
    <Card className="w-full border shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl">
            {authMode === "login" ? "Start your process" : "Create your account"}
          </CardTitle>
          <button
            onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
            className="text-sm text-primary hover:underline"
          >
            {authMode === "login" ? "Need an account?" : "Already have an account?"}
          </button>
        </div>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AuthMethod)} defaultValue="wallet">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="wallet" className="gap-1">
              <Wallet className="h-3.5 w-3.5" /> Wallet
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-1">
              <UserCircle2 className="h-3.5 w-3.5" /> Social
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-1">
              <Mail className="h-3.5 w-3.5" /> Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="mt-4 space-y-3">
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-sm font-medium">Continue with Privy Wallet</p>
              <p className="mt-1 text-xs text-muted-foreground">Opens Privy wallet authentication (including embedded wallet options).</p>
              <Button
                className="mt-3 w-full"
                onClick={() => handlePrivyLogin("wallet", "wallet")}
                disabled={loadingMethod === "wallet"}
              >
                {loadingMethod === "wallet" ? "Connecting..." : "Continue with Privy Wallet"}
              </Button>
            </div>

            <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
              <WalletAuthForm mode={authMode} />
            </div>
          </TabsContent>

          <TabsContent value="social" className="mt-4">
            <div className="rounded-xl border bg-muted/20 p-6 text-center animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <h4 className="text-base font-semibold">Continue with social account</h4>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Authenticate with supported social providers through Privy.
              </p>
              <Button
                className="mt-4"
                onClick={() => handlePrivyLogin("social", "social")}
                disabled={loadingMethod === "social"}
              >
                {loadingMethod === "social" ? "Connecting..." : "Continue with Social"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="email" className="mt-4">
            <div className="rounded-xl border bg-muted/20 p-6 text-center animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <h4 className="text-base font-semibold">Continue with email</h4>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Passwordless email authentication powered by Privy.
              </p>
              <Button
                className="mt-4"
                onClick={() => handlePrivyLogin("email", "email")}
                disabled={loadingMethod === "email"}
              >
                {loadingMethod === "email" ? "Connecting..." : "Continue with Email"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
