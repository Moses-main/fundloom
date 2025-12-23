import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Header } from "./components/Header";
const HomePage = lazy(() => import("./pages/Home"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const OAuthCallbackPage = lazy(() => import("./pages/OAuthCallback"));
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/routing/ProtectedRoute";
// import CampaignsPage from "./pages/CampaignsPage";
const MyCampaignsPage = lazy(() => import("./pages/MyCampaignsPage"));
const MyDonationsPage = lazy(() => import("./pages/MyDonationsPage"));
// import CreateCampaignPage from "./pages/CreateCampaignPage";
const ForgotWalletPage = lazy(() => import("./pages/ForgotWallet"));
// import DashboardPage from "./pages/Dashboard";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const CampaignsPage = lazy(() => import("./pages/CampaignsPage"));
import StarknetProvider from "./utils/starknetProvider";
import { ToastProvider } from "./components/ui/ToastProvider";
const AdminPage = lazy(() => import("./pages/AdminPage"));
const CampaignDonorsPage = lazy(() => import("./pages/CampaignDonorsPage"));
const CampaignReportPage = lazy(() => import("./pages/CampaignReportPage"));
const CampaignDiscussionPage = lazy(
  () => import("./pages/CampaignDiscussionPage")
);
const SharedCampaignPage = lazy(() => import("./pages/SharedCampaignPage"));
const ThankYouPage = lazy(() => import("./pages/ThankYouPage"));
import { LoadingProvider } from "./context/LoadingContext";
import LoadingOverlay from "./components/ui/LoadingOverlay";

// testing with the entire application
// import Entire from "./entireApp";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="Fundloom-theme">
      <StarknetProvider>
        <ToastProvider>
          <LoadingProvider>
            <AuthProvider>
              <AppProvider>
                <div className="min-h-screen bg-background">
                  <Header />
                  <Suspense fallback={<LoadingOverlay />}>
                    <Routes>
                      <Route path="/admin" element={<AdminPage />} />
                      <Route path="/" element={<HomePage />} />
                      <Route path="/auth" element={<AuthPage />} />

                      <Route
                        path="/shared-campaign/:id"
                        element={<SharedCampaignPage />}
                      />
                      <Route
                        path="/auth/callback"
                        element={<OAuthCallbackPage />}
                      />
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
                      <Route
                        path="/campaigns/shared/:id"
                        element={<SharedCampaignPage />}
                      />
                      <Route
                        path="/campaigns/:id"
                        element={<SharedCampaignPage />}
                      />
                      <Route path="/thank-you" element={<ThankYouPage />} />
                      <Route
                        path="/campaigns/:id/donors"
                        element={
                          <ProtectedRoute>
                            <CampaignDonorsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/campaigns/:id/report"
                        element={<CampaignReportPage />}
                      />
                      <Route
                        path="/campaigns/:id/discussion"
                        element={<CampaignDiscussionPage />}
                      />
                      <Route
                        path="/campaign/:campaignId"
                        element={<SharedCampaignPage />}
                      />
                      <Route
                        path="/profile"
                        element={
                          <Navigate to="/dashboard?tab=profile" replace />
                        }
                      />
                      <Route
                        path="/forgot-wallet"
                        element={<ForgotWalletPage />}
                      />
                    </Routes>
                  </Suspense>
                  <LoadingOverlay />
                </div>
              </AppProvider>
            </AuthProvider>
          </LoadingProvider>
        </ToastProvider>
      </StarknetProvider>
    </ThemeProvider>
  );
}

export default App;
