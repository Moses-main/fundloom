// import React from "react";
// import { useAppContext } from "../context/AppContext";

// export default function DonatePage() {
//   const {
//     selectedCampaign,
//     setShowDonationModal,
//     walletConnected,
//     setActiveTab,
//   } = useAppContext();

//   if (!selectedCampaign) {
//     return (
//       <div>
//         <p>
//           No campaign selected. Please select a campaign on the Campaigns tab.
//         </p>
//         <button
//           onClick={() => setActiveTab("campaigns")}
//           className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//         >
//           Go to Campaigns
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-3xl mx-auto space-y-6">
//       <h1 className="text-3xl font-bold">{selectedCampaign.title}</h1>
//       <img
//         src={selectedCampaign.imageUrl}
//         alt={selectedCampaign.title}
//         className="w-full h-64 object-cover rounded"
//       />
//       <p>{selectedCampaign.description}</p>
//       <p>
//         <strong>Category:</strong> {selectedCampaign.category}
//       </p>
//       <p>
//         <strong>Raised:</strong> ${selectedCampaign.raisedAmount} / $
//         {selectedCampaign.targetAmount}
//       </p>
//       {!walletConnected ? (
//         <p className="text-red-600 font-semibold">
//           Please connect your wallet to donate.
//         </p>
//       ) : (
//         <button
//           onClick={() => setShowDonationModal(true)}
//           className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
//         >
//           Donate Now
//         </button>
//       )}
//     </div>
//   );
// }

// src/pages/DonatePage.tsx
import React from "react";
import { useAppContext } from "../context/AppContext";
import CampaignDetail from "../components/CampaignDetail";
import DiscussionBoard from "../components/DiscussionBoard";
import DonorList from "../components/DonorList";

const DonatePage: React.FC = () => {
  const { selectedCampaign } = useAppContext();
  if (!selectedCampaign)
    return <div>No campaign selected. Pick one from campaigns tab.</div>;

  return (
    <div className="space-y-6">
      <CampaignDetail />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <DiscussionBoard />
        </div>
        <div>
          <DonorList />
        </div>
      </div>
    </div>
  );
};

export default DonatePage;
