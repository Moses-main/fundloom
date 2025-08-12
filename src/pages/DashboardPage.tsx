// // =============================
// import React, { useEffect } from "react";
// import { AppProvider, useAppContext } from "./../context/AppContext";
// import Header from "../components/Header";
// import CampaignsPage from "../pages/CampaignsPage";
// import DonatePage from "../pages/DonatePage";
// import ProfilePage from "../pages/ProfilePage";
// import CreateCampaignModal from "../components/CreateCampaignModal";
// import DonationModal from "../components/DonationModal";
// import ThankYouModal from "../components/ThankYouModal";

// function Content() {
//   const {
//     activeTab,
//     theme,
//     showCreateModal,
//     showDonationModal,
//     showThankYouModal,
//   } = useAppContext();

//   // Apply theme class to body
//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", theme === "dark");
//   }, [theme]);

//   return (
//     <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
//       <Header />
//       <main className="p-4 max-w-7xl mx-auto">
//         {activeTab === "campaigns" && <CampaignsPage />}
//         {activeTab === "donate" && <DonatePage />}
//         {activeTab === "profile" && <ProfilePage />}
//       </main>

//       {showCreateModal && <CreateCampaignModal />}
//       {showDonationModal && <DonationModal />}
//       {showThankYouModal && <ThankYouModal />}
//     </div>
//   );
// }

// export default function App() {
//   return (
//     <AppProvider>
//       <Content />
//     </AppProvider>
//   );
// }

// src/pages/App.tsx
import React from "react";
import { AppProvider } from "../context/AppContext";
import Shell from "../shell/Shell";

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
