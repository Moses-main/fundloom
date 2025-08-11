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

  return (
    <div className="min-h-[80vh] max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AuthTabs initialMode={initialMode} />
    </div>
  );
} 