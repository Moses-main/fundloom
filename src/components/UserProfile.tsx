// // ==============================
// // src/components/UserProfile.tsx
// // // ==============================

// import React from "react";
// import { Campaign, Donation } from "../types";
// import { Clock, DollarSign } from "lucide-react";
// import { formatAmount, formatDate } from "../utils/formatters";

// interface Props {
//   donations: Donation[];
//   campaigns: Campaign[];
//   userAddress: string;
// }

// export const UserProfile: React.FC<Props> = ({
//   donations,
//   campaigns,
//   userAddress,
// }) => {
//   const userDonations = donations.filter(
//     (donation) => donation.donor_address === userAddress
//   );

//   if (userDonations.length === 0) {
//     return (
//       <div className="bg-white rounded-xl p-6 shadow-md">
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">
//           Your Donations
//         </h2>
//         <p className="text-gray-600">
//           You haven't donated to any campaigns yet.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       <h2 className="text-2xl font-bold">Your Donations</h2>
//       {userDonations.map((donation) => {
//         const campaign = campaigns.find((c) => c.id === donation.campaign_id);

//         return (
//           <div
//             key={donation.id}
//             className="p-4 border border-gray-200 rounded-xl flex items-start space-x-4 bg-white shadow-sm"
//           >
//             <div className="bg-blue-100 p-2 rounded-lg">
//               <DollarSign className="h-5 w-5 text-blue-600" />
//             </div>
//             <div>
//               <h3 className="font-semibold">{campaign?.title}</h3>
//               <p className="text-sm text-gray-600 italic">
//                 {donation.donor_message || "No message"}
//               </p>
//               <p className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
//                 <Clock className="h-3 w-3" />
//                 <span>{formatDate(donation.timestamp)}</span>
//               </p>
//               <p className="text-sm text-gray-700 mt-1">
//                 Amount Donated:{" "}
//                 <strong>₦{formatAmount(donation.amount)}</strong>
//               </p>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };
