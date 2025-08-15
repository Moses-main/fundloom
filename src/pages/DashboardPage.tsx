// src/pages/DashboardPage.tsx
import React from "react";
import Shell from "../shell/Shell";

export default function DashboardPage() {
  // AppProvider is already applied at the application root (App.tsx)
  // Only render the Shell here to avoid double providers and duplicate headers
  return <Shell />;
}
