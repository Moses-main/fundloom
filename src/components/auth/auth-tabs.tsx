"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { EmailAuthForm } from "./email-auth-form";
import { WalletAuthForm } from "./wallet-auth-form";

interface AuthTabsProps {
  initialMode?: "login" | "signup";
}

export function AuthTabs({ initialMode = "login" }: AuthTabsProps) {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    setAuthMode(initialMode);
  }, [initialMode]);

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {authMode === "login" ? "Sign In" : "Create Account"}
          </CardTitle>
          <button
            onClick={() =>
              setAuthMode(authMode === "login" ? "signup" : "login")
            }
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {authMode === "login"
              ? "Need an account?"
              : "Already have an account?"}
          </button>
        </div>
        <CardDescription>
          {authMode === "login"
            ? "Sign in with your email or connect your wallet"
            : "Create your account to start fundraising"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="email">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
          </TabsList>
          <TabsContent value="email" className="mt-4">
            <EmailAuthForm mode={authMode} />
          </TabsContent>
          <TabsContent value="wallet" className="mt-4">
            <WalletAuthForm mode={authMode} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
