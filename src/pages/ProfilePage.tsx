import React from "react";
import { useState } from "react";
import { Button } from "../components/ui/Button"; // Adjust path based on your folder structure
import { Input } from "../components/ui/Input"; // Adjust path based on your folder structure
import {
  User,
  DollarSign,
  Clock,
  CreditCard,
  Shield,
  Bell,
  Moon,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  bio: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>({
    name: "John Doe",
    email: "john.doe@example.com",
    bio: "Software developer passionate about blockchain and web3.",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [prefDarkMode, setPrefDarkMode] = useState(false);
  const [prefEmailNotif, setPrefEmailNotif] = useState(true);
  const [googleConnected] = useState(true);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Here you can connect an API call to save changes
    setIsEditing(false);
    console.log("Profile saved:", profile);
  };

  return (
    <div className="min-h-screen px-4 py-6 bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Profile</h1>

        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <User className="h-7 w-7 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex-1">
              <div className="text-xl font-semibold">{profile.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</div>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Donations</div>
              <div className="text-lg font-semibold">₦0</div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Campaigns Supported</div>
              <div className="text-lg font-semibold">0</div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Last Login</div>
              <div className="text-lg font-semibold">—</div>
            </div>
          </div>
        </div>

        {/* Edit Details */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="mb-4">
            <label className="block font-medium mb-2" htmlFor="name">
              Name
            </label>
            {isEditing ? (
              <Input
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
              />
            ) : (
              <p>{profile.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-2" htmlFor="email">
              Email
            </label>
            {isEditing ? (
              <Input
                id="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
              />
            ) : (
              <p>{profile.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-2" htmlFor="bio">
              Bio
            </label>
            {isEditing ? (
              <textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2"
                rows={4}
              />
            ) : (
              <p>{profile.bio}</p>
            )}
          </div>

          <div className="flex gap-4">
            {isEditing ? (
              <>
                <Button onClick={handleSave}>Save</Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <div className="text-sm text-gray-500">Use the Edit button above to update your details.</div>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" /> Preferences
          </h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email notifications</div>
                <div className="text-sm text-gray-500">Receive updates about campaigns and donations.</div>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={prefEmailNotif}
                onChange={(e) => setPrefEmailNotif(e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <div>
                  <div className="font-medium">Dark mode</div>
                  <div className="text-sm text-gray-500">Toggle site theme preference.</div>
                </div>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={prefDarkMode}
                onChange={(e) => setPrefDarkMode(e.target.checked)}
              />
            </label>
          </div>
          <div className="mt-4">
            <Button onClick={() => console.log("Saved preferences", { prefDarkMode, prefEmailNotif })}>
              Save Preferences
            </Button>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <LinkIcon className="h-5 w-5" /> Connected Accounts
          </h2>
          <div className="flex items-center justify-between border rounded-md p-4">
            <div>
              <div className="font-medium">Google</div>
              <div className="text-sm text-gray-500">
                {googleConnected ? "Connected via OAuth" : "Not connected"}
              </div>
            </div>
            <Button variant="secondary" onClick={() => console.log("Manage Google connection")}>Manage</Button>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" /> Security
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input type="password" placeholder="Current password" />
            <Input type="password" placeholder="New password" />
            <Input type="password" placeholder="Confirm new password" />
          </div>
          <div className="mt-4">
            <Button onClick={() => console.log("Change password submitted")}>Update Password</Button>
          </div>
          <div className="mt-6 border-t pt-6">
            <h3 className="font-semibold mb-2">Danger zone</h3>
            <Button
              variant="destructive"
              onClick={() => console.warn("Delete account clicked")}
              className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" /> Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

// src/pages/ProfilePage.tsx

// import React from "react";
// import { Link } from "react-router-dom";
// import { useAppContext } from "../context/AppContext";
// import { DollarSign, Clock, CreditCard, User } from "lucide-react";
// import { Button } from "../components/ui/Button";

// const ProfilePage: React.FC = () => {
//   const {
//     walletConnected,
//     userAddress,
//     donations,
//     campaigns,
//     formatAmount,
//     formatDate,
//     connectWallet,
//   } = useAppContext();

//   // Determine if user has JWT session (email/password auth)
//   let authedUser: { fullname?: string; name?: string; email?: string } | null =
//     null;
//   let hasJwt = false;
//   try {
//     const token = localStorage.getItem("auth_token");
//     const rawUser = localStorage.getItem("auth_user");
//     if (token && rawUser) {
//       hasJwt = true;
//       authedUser = JSON.parse(rawUser);
//     }
//   } catch {}

//   if (!walletConnected && !hasJwt) {
//     return (
//       <div className="text-center py-16 space-y-4">
//         <p className="text-lg">
//           Please sign in or connect your wallet to view your profile.
//         </p>
//         <div className="flex items-center justify-center gap-3">
//           <Button asChild>
//             <Link to="/auth">Sign In</Link>
//           </Button>
//           <Button variant="outline" onClick={connectWallet}>
//             Connect Wallet
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   const myDonations = walletConnected
//     ? donations.filter((d) => d.donor_address === userAddress)
//     : [];

//   return (
//     <div className="space-y-6">
//       {/* Profile summary */}
//       <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
//         <div className="flex items-center gap-4">
//           <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
//             <User className="h-6 w-6 text-muted-foreground" />
//           </div>
//           <div>
//             <h2 className="text-xl font-semibold text-gray-900">
//               {authedUser?.fullname ||
//                 authedUser?.name ||
//                 (walletConnected ? userAddress : "User")}
//             </h2>
//             <p className="text-sm text-gray-600">
//               {authedUser?.email ||
//                 (walletConnected
//                   ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
//                   : "")}
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
//         <h2 className="text-2xl font-bold text-gray-900 mb-6">
//           Your Donation History
//         </h2>
//         <div className="space-y-4">
//           {walletConnected &&
//             myDonations.map((d) => {
//               const campaign = campaigns.find((c) => c.id === d.campaign_id);
//               return (
//                 <div
//                   key={d.id}
//                   className="flex items-start space-x-4 p-4 border border-gray-200 rounded-xl"
//                 >
//                   <div className="bg-green-100 p-2 rounded-lg">
//                     <DollarSign className="h-5 w-5 text-green-600" />
//                   </div>
//                   <div className="flex-1">
//                     <h4 className="font-semibold text-gray-900">
//                       {campaign?.title}
//                     </h4>
//                     <p className="text-sm text-gray-600 mb-2">
//                       ₦{formatAmount(d.amount)} donated
//                     </p>
//                     {d.donor_message && (
//                       <p className="text-sm text-gray-700 italic">
//                         "{d.donor_message}"
//                       </p>
//                     )}
//                     <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
//                       <div className="flex items-center space-x-1">
//                         <Clock className="h-3 w-3" />
//                         <span>{formatDate(d.timestamp)}</span>
//                       </div>
//                       <div className="flex items-center space-x-1">
//                         <CreditCard className="h-3 w-3" />
//                         <span>{d.payment_method}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           {!walletConnected && (
//             <div className="text-sm text-gray-500">
//               Connect your wallet to see your on-chain donation history.
//             </div>
//           )}
//           {walletConnected && myDonations.length === 0 && (
//             <div className="text-sm text-gray-500">
//               You have not made any donations yet.
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;
