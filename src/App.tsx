import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Header } from "./components/Header";
import HomePage from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import OAuthCallbackPage from "./pages/OAuthCallback";
import { AppProvider } from "./context/AppContext";
// import CampaignsPage from "./pages/CampaignsPage";
// import CreateCampaignPage from "./pages/CreateCampaignPage";
import ForgotWalletPage from "./pages/ForgotWallet";
// import DashboardPage from "./pages/Dashboard";

import DashboardPage from "./pages/DashboardPage";
import CampaignsPage from "./pages/CampaignsPage";

// testing with the entire application
// import Entire from "./entireApp";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="Fundloom-theme">
      <AppProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/callback" element={<OAuthCallbackPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            {/* <Route path="/campaigns/create" element={<CreateCampaignPage />} /> */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<Navigate to="/dashboard?tab=profile" replace />} />
            <Route path="/forgot-wallet" element={<ForgotWalletPage />} />
          </Routes>
        </div>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
