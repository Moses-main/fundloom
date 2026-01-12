// src/context/LoadingContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loadingBus } from "@/lib/loadingBus";
import { useLocation } from "react-router-dom";

export type LoadingContextType = {
  isLoading: boolean;
  activeTags: Set<string>;
  begin: (tag?: string) => void;
  end: (tag?: string) => void;
  wrap: <T>(promiseOrFn: Promise<T> | (() => Promise<T>), tag?: string) => Promise<T>;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used within LoadingProvider");
  return ctx;
};

export const LoadingProvider: React.FC<{ children: React.ReactNode; routeAuto?: boolean }>
  = ({ children, routeAuto = true }) => {
  const [isLoading, setIsLoading] = useState<boolean>(loadingBus.isLoading());
  const [activeTags, setActiveTags] = useState<Set<string>>(loadingBus.activeTags());

  useEffect(() => {
    const unsub = loadingBus.subscribe((loading, tags) => {
      setIsLoading(loading);
      setActiveTags(new Set(tags));
    });
    return unsub;
  }, []);

  // Optional: show a short global loading when route changes (helps avoid blank flashes)
  const location = useLocation();
  useEffect(() => {
    if (!routeAuto) return;
    let done = false;
    loadingBus.begin("route");
    // End on next tick to avoid long overlay during fast transitions; extend if still busy elsewhere
    const t = setTimeout(() => {
      if (!done) loadingBus.end("route");
    }, 250);
    return () => {
      done = true;
      clearTimeout(t);
      loadingBus.end("route");
    };
  }, [location, routeAuto]);

  const begin = useCallback((tag?: string) => loadingBus.begin(tag), []);
  const end = useCallback((tag?: string) => loadingBus.end(tag), []);
  const wrap = useCallback(<T,>(p: Promise<T> | (() => Promise<T>), tag?: string) => loadingBus.wrap<T>(p as any, tag), []);

  const value = useMemo<LoadingContextType>(() => ({ isLoading, activeTags, begin, end, wrap }), [isLoading, activeTags, begin, end, wrap]);

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};
