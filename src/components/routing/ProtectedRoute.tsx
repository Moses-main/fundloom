// src/components/routing/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    // If a shared donation link (?campaign=...) led here, preserve it by redirecting to home with the same query
    const search = location.search;
    if (search && new URLSearchParams(search).has("campaign")) {
      return <Navigate to={`/${search}`} replace state={{ from: location }} />;
    }
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
};
