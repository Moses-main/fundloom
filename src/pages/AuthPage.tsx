import { useLocation } from "react-router-dom";
import { AuthTabs } from "@/components/auth/auth-tabs";

export default function AuthPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const m = params.get("mode");
  const initialMode = m === "signup" ? "signup" : "login";
  const reason = params.get("reason");

  return (
    <div className="mx-auto min-h-[70vh] max-w-xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 animate-in fade-in-0 slide-in-from-top-1 duration-300">
        <h1 className="text-2xl font-semibold">Authentication</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start with Privy-style authentication and choose wallet, social, or email.
        </p>
      </div>

      {reason === "expired" && (
        <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          Your session expired. Please sign in again.
        </div>
      )}
      <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
        <AuthTabs initialMode={initialMode} />
      </div>
    </div>
  );
}
