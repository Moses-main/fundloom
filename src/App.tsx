import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Header } from "./components/Header";
import HomePage from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import OAuthCallbackPage from "./pages/OAuthCallback";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/routing/ProtectedRoute";
// import CampaignsPage from "./pages/CampaignsPage";
import MyCampaignsPage from "./pages/MyCampaignsPage";
import MyDonationsPage from "./pages/MyDonationsPage";
// import CreateCampaignPage from "./pages/CreateCampaignPage";
import ForgotWalletPage from "./pages/ForgotWallet";
// import DashboardPage from "./pages/Dashboard";

import DashboardPage from "./pages/DashboardPage";
import CampaignsPage from "./pages/CampaignsPage";
import StarknetProvider from "./utils/starknetProvider";
import FeaturePage from "./pages/Feature";
import { ToastProvider } from "./components/ui/ToastProvider";

// testing with the entire application
// import Entire from "./entireApp";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="Fundloom-theme">
      <StarknetProvider>
        <ToastProvider>
          <AuthProvider>
            <AppProvider>
              <div className="min-h-screen bg-background">
                <Header />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/auth/callback" element={<OAuthCallbackPage />} />
                  <Route path="/campaigns" element={<CampaignsPage />} />
                  {/* <Route path="/campaigns/create" element={<CreateCampaignPage />} /> */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-campaigns"
                    element={
                      <ProtectedRoute>
                        <MyCampaignsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-donations"
                    element={
                      <ProtectedRoute>
                        <MyDonationsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/feature" element={<FeaturePage />} />
                  <Route
                    path="/profile"
                    element={<Navigate to="/dashboard?tab=profile" replace />}
                  />
                  <Route path="/forgot-wallet" element={<ForgotWalletPage />} />
                </Routes>
              </div>
            </AppProvider>
          </AuthProvider>
        </ToastProvider>
      </StarknetProvider>
    </ThemeProvider>
  );
}

export default App;
