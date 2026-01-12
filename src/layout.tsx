import React from "react";
import "./App.css";
import { ThemeProvider } from "./components/theme-provider";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="font-sans antialiased">
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        storageKey="fundloom-theme"
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </div>
  );
}
