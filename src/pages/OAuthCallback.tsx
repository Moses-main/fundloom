import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setAuth } from "@/lib/api";

export default function OAuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userStr = params.get("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        setAuth({ user, token });
        navigate("/dashboard", { replace: true });
        return;
      } catch (e) {
        // fallthrough to redirect with error
      }
    }

    const error = params.get("error") || "oauth_failed";
    navigate(`/auth?error=${encodeURIComponent(error)}`, { replace: true });
  }, [location.search, navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-sm text-muted-foreground">Completing sign-in…</div>
    </div>
  );
}
