"use client";

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { Wallet } from "lucide-react";

// Email authentication has been disabled
// Only wallet authentication is available

interface EmailAuthFormProps {
  mode: "login" | "signup";
}

interface EmailAuthFormProps {
  mode: "login" | "signup";
}

export function EmailAuthForm({ mode }: EmailAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { show: toast } = useToast();

  const handleWalletConnect = () => {
    // This will be handled by the parent component
    // which should have a WalletAuthForm component
    navigate("?mode=wallet", { replace: true });
  };

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Wallet className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Wallet Authentication</h2>
        <p className="text-muted-foreground">
          Please connect your wallet to continue
        </p>
      </div>

      <Button
        type="button"
        className="w-full"
        onClick={handleWalletConnect}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Connecting...
          </>
        ) : (
          'Connect Wallet'
        )}
      </Button>
    </div>
  );
}
