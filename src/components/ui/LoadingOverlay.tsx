// src/components/ui/LoadingOverlay.tsx
import React from "react";
import { useLoading } from "@/context/LoadingContext";
import Spinner from "./Spinner";

const overlayStyle:
  React.CSSProperties = {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.35)",
    zIndex: 9999,
    backdropFilter: "saturate(120%) blur(2px)",
  };

export const LoadingOverlay: React.FC<{
  showTags?: boolean;
  minDelayMs?: number; // delay before showing to avoid flicker on ultra-fast ops
}> = ({ showTags = false, minDelayMs = 120 }) => {
  const { isLoading, activeTags } = useLoading();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    let t: any;
    if (isLoading) {
      t = setTimeout(() => setVisible(true), minDelayMs);
    } else {
      setVisible(false);
    }
    return () => t && clearTimeout(t);
  }, [isLoading, minDelayMs]);

  if (!visible) return null;

  const tags = Array.from(activeTags);

  return (
    <div style={overlayStyle} role="status" aria-label="Loading">
      <div className="flex flex-col items-center gap-3 p-4 rounded-md bg-background/90 shadow-xl">
        <Spinner size={36} />
        <div className="text-sm text-foreground/80">Loading...</div>
        {showTags && tags.length > 0 && (
          <div className="text-xs text-foreground/60">{tags.join(", ")}</div>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
