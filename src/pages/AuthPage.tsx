import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { AuthTabs } from "@/components/auth/auth-tabs";

export default function AuthPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialMode = useMemo(() => {
    const m = params.get("mode");
    return m === "signup" ? "signup" : "login";
  }, [location.search]);
  const reason = params.get("reason");

  return (
    <div className="min-h-[70vh] max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {reason === "expired" && (
        <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 text-yellow-800 px-3 py-2 text-sm">
          Your session expired. Please sign in again.
        </div>
      )}
      <AuthTabs initialMode={initialMode} />
    </div>
  );
}