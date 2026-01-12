import React from "react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "../components/ui/Button"; // Adjust path based on your folder structure
import { Input } from "../components/ui/Input"; // Adjust path based on your folder structure
import {
  API_BASE_URL,
  getMe,
  getUserDashboard,
  changePassword,
  deleteAccount,
  clearAuth,
  disconnectGoogle,
} from "../lib/api";
import { useToast } from "@/components/ui/ToastProvider";
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
  Copy as CopyIcon,
} from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  bio: string;
}

const ProfilePage: React.FC = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const { show: toast } = useToast();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const initialUser = (() => {
    try {
      const raw = localStorage.getItem("auth_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [profile, setProfile] = useState<ProfileData>({
    name: initialUser?.name || initialUser?.fullname || "John Doe",
    email: initialUser?.email || "john.doe@example.com",
    bio:
      initialUser?.profile?.bio ||
      "Software developer passionate about blockchain and web3.",
  });
  const [lastLogin, setLastLogin] = useState<string | null>(
    initialUser?.lastLogin || null
  );

  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<{
    totalDonated: number;
    totalDonations: number;
  }>({ totalDonated: 0, totalDonations: 0 });
  const [prefEmailNotif, setPrefEmailNotif] = useState(true);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [primaryWallet, setPrimaryWallet] = useState<string | null>(
    initialUser?.walletAddress || null
  );
  const [wallets, setWallets] = useState<
    Array<{ provider?: string; chainType?: string; address: string }>
  >([]);
  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast({
        type: "info",
        title: "Login required",
        description: "Please log in to save your profile.",
      });
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          bio: profile.bio,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || "Failed to update profile");
      // Update local storage auth_user minimal info
      try {
        const raw = localStorage.getItem("auth_user");
        if (raw) {
          const u = JSON.parse(raw);
          u.name = profile.name || u.name;
          localStorage.setItem("auth_user", JSON.stringify(u));
        }
      } catch {}
      setIsEditing(false);
      toast({
        type: "success",
        title: "Profile updated",
        description: "Your profile changes have been saved.",
      });
    } catch (e: any) {
      toast({
        type: "error",
        title: "Save failed",
        description: e?.message || "Unable to save profile",
      });
    }
  };

  // Load the authenticated user from backend
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    const load = async () => {
      try {
        const me = await getMe();
        if (me?.success && me.data?.user) {
          const u = me.data.user;
          setProfile((prev) => ({
            name: u.name || u.fullname || prev.name,
            email: u.email || prev.email,
            bio: (u.profile && u.profile.bio) || prev.bio,
          }));
          if (u.lastLogin) setLastLogin(u.lastLogin);
          if (
            u.preferences &&
            typeof u.preferences.emailNotifications === "boolean"
          ) {
            setPrefEmailNotif(!!u.preferences.emailNotifications);
          }
          setGoogleConnected(!!u.oauth?.google?.id);
          if (u.walletAddress) setPrimaryWallet(u.walletAddress);
          if (Array.isArray(u.wallets)) setWallets(u.wallets);
        }
        // Load dashboard stats
        const dash = await getUserDashboard();
        if (dash?.success && dash.data?.stats) {
          const d = dash.data.stats.donations || {
            totalDonations: 0,
            totalDonated: 0,
          };
          setStats({
            totalDonations: d.totalDonations || 0,
            totalDonated: d.totalDonated || 0,
          });
        }
      } catch (e) {
        console.warn("Failed to load profile:", e);
      }
    };
    load();
  }, []);

  const formatNaira = (n: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(n || 0);

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
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {profile.email}
              </div>
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
              <div className="text-lg font-semibold">
                {formatNaira(stats.totalDonated)}
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Campaigns Supported</div>
              <div className="text-lg font-semibold">
                {stats.totalDonations}
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Last Login</div>
              <div className="text-lg font-semibold">
                {lastLogin ? new Date(lastLogin).toLocaleString() : "—"}
              </div>
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
              <div className="text-sm text-gray-500">
                Use the Edit button above to update your details.
              </div>
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
                <div className="text-sm text-gray-500">
                  Receive updates about campaigns and donations.
                </div>
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
                  <div className="text-sm text-gray-500">
                    Toggle site theme preference. Current:{" "}
                    {mounted ? resolvedTheme : "..."}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={mounted ? resolvedTheme === "dark" : false}
                onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
              />
            </label>
          </div>
          <div className="mt-4">
            <Button
              onClick={async () => {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                  toast({
                    type: "info",
                    title: "Login required",
                    description: "Please log in to save preferences.",
                  });
                  return;
                }
                try {
                  const res = await fetch(`${API_BASE_URL}/users/profile`, {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      preferences: { emailNotifications: prefEmailNotif },
                    }),
                  });
                  const body = await res.json();
                  if (!res.ok)
                    throw new Error(
                      body?.message || "Failed to save preferences"
                    );
                  toast({
                    type: "success",
                    title: "Preferences saved",
                    description:
                      "Your notification preference has been updated.",
                  });
                } catch (e: any) {
                  toast({
                    type: "error",
                    title: "Save failed",
                    description: e?.message || "Unable to save preferences",
                  });
                }
              }}
            >
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
            <Button
              variant="secondary"
              onClick={async () => {
                if (googleConnected) {
                  try {
                    const res = await disconnectGoogle();
                    if (res?.success) {
                      setGoogleConnected(false);
                      toast({
                        type: "success",
                        title: "Disconnected",
                        description: "Google account disconnected.",
                      });
                    }
                  } catch (e: any) {
                    toast({
                      type: "error",
                      title: "Failed",
                      description: e?.message || "Could not disconnect Google",
                    });
                  }
                } else {
                  try {
                    if (typeof window !== "undefined") {
                      const state = encodeURIComponent(window.location.origin);
                      window.location.href = `${API_BASE_URL}/auth/google?state=${state}`;
                    }
                  } catch {}
                }
              }}
            >
              Manage
            </Button>
          </div>

          {/* Wallets */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Wallets</h3>
            {primaryWallet ? (
              <div className="border rounded-md p-4 mb-3">
                <div className="text-sm text-gray-500 mb-1">Primary (EVM)</div>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm break-all">
                    {primaryWallet.slice(0, 10)}...{primaryWallet.slice(-8)}
                  </code>
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(primaryWallet!);
                        toast({
                          type: "success",
                          title: "Copied",
                          description: "Address copied",
                        });
                      } catch {}
                    }}
                    className="flex items-center gap-2"
                  >
                    <CopyIcon className="h-4 w-4" /> Copy
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 mb-3">
                No primary wallet yet.
              </div>
            )}

            {/* Additional wallets collapsible */}
            {wallets.filter(
              (w) =>
                !primaryWallet ||
                w.address?.toLowerCase() !== primaryWallet.toLowerCase()
            ).length > 0 && (
              <details className="border rounded-md p-4">
                <summary className="cursor-pointer select-none font-medium">
                  Additional wallets
                </summary>
                <div className="mt-3 space-y-3">
                  {wallets
                    .filter(
                      (w) =>
                        !primaryWallet ||
                        w.address?.toLowerCase() !== primaryWallet.toLowerCase()
                    )
                    .map((w, idx) => (
                      <div
                        key={`${w.address}-${idx}`}
                        className="flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            {w.provider || "wallet"} • {w.chainType || "chain"}
                          </div>
                          <code className="text-sm break-all">
                            {w.address?.slice(0, 10)}...{w.address?.slice(-8)}
                          </code>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(w.address);
                              toast({
                                type: "success",
                                title: "Copied",
                                description: "Address copied",
                              });
                            } catch {}
                          }}
                          className="flex items-center gap-2"
                        >
                          <CopyIcon className="h-4 w-4" /> Copy
                        </Button>
                      </div>
                    ))}
                </div>
              </details>
            )}
            <p className="text-xs text-gray-500 mt-3">
              Wallets are provisioned automatically for new accounts. Private
              keys for Privy wallets are managed by Privy and are not exposed.
            </p>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" /> Security
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <Button
              onClick={async () => {
                try {
                  const token = localStorage.getItem("auth_token");
                  if (!token) {
                    toast({
                      type: "info",
                      title: "Login required",
                      description: "Please log in to change your password.",
                    });
                    return;
                  }
                  if (!currentPassword || !newPassword) {
                    toast({
                      type: "error",
                      title: "Missing fields",
                      description: "Please fill in current and new password.",
                    });
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    toast({
                      type: "error",
                      title: "Password mismatch",
                      description:
                        "New password and confirmation do not match.",
                    });
                    return;
                  }
                  const res = await changePassword({
                    currentPassword,
                    newPassword,
                  });
                  if (res?.success) {
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    toast({
                      type: "success",
                      title: "Password updated",
                      description: "Your password was changed successfully.",
                    });
                  }
                } catch (e: any) {
                  toast({
                    type: "error",
                    title: "Update failed",
                    description: e?.message || "Unable to change password",
                  });
                }
              }}
            >
              Update Password
            </Button>
          </div>
          <div className="mt-6 border-t pt-6">
            <h3 className="font-semibold  mb-2">Danger zone</h3>
            <Button
              variant="destructive"
              onClick={async () => {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                  toast({
                    type: "info",
                    title: "Login required",
                    description: "Please log in first.",
                  });
                  return;
                }
                const confirmed = window.confirm(
                  "Are you sure you want to permanently delete your account? This action cannot be undone."
                );
                if (!confirmed) return;
                try {
                  const res = await deleteAccount();
                  if (res?.success) {
                    clearAuth();
                    toast({
                      type: "success",
                      title: "Account deleted",
                      description: "Your account has been deleted.",
                    });
                    try {
                      if (typeof window !== "undefined") {
                        window.location.replace("/auth");
                      }
                    } catch {}
                  }
                } catch (e: any) {
                  toast({
                    type: "error",
                    title: "Deletion failed",
                    description: e?.message || "Unable to delete account",
                  });
                }
              }}
              className="bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4 text-white" /> Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
