import React, { useEffect, useMemo, useState } from "react";
import {
  adminListCampaigns,
  adminApproveCampaign,
  adminActivateCampaign,
  adminDeactivateCampaign,
  adminListUsers,
  adminLockUser,
  adminUnlockUser,
  adminDeleteUser,
  BasicAuth,
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

const AdminPage: React.FC = () => {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [basicToken, setBasicToken] = useState<string | null>(null);

  // Data state
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [campPage, setCampPage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  const authed: BasicAuth | null = useMemo(
    () => (basicToken ? { basicToken } : null),
    [basicToken]
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = btoa(`${username}:${password}`);
      setBasicToken(token);
      toast({
        type: "success",
        title: "Admin Auth",
        description: "Authenticated",
      });
    } catch {
      toast({
        type: "error",
        title: "Admin Auth",
        description: "Failed to encode credentials",
      });
    }
  };

  const fetchCampaigns = async () => {
    if (!authed) return;
    try {
      const res = await adminListCampaigns(
        { page: campPage, limit: 25 },
        authed
      );
      if (res.success && (res as any).data) {
        setCampaigns((res as any).data.campaigns || []);
      }
    } catch (e: any) {
      toast({
        type: "error",
        title: "Fetch campaigns",
        description: e.message,
      });
    }
  };

  const fetchUsers = async () => {
    if (!authed) return;
    try {
      const res = await adminListUsers({ page: userPage, limit: 25 }, authed);
      if (res.success && (res as any).data) {
        setUsers((res as any).data.users || []);
      }
    } catch (e: any) {
      toast({ type: "error", title: "Fetch users", description: e.message });
    }
  };

  useEffect(() => {
    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, campPage]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, userPage]);

  if (!authed) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="pass"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              className="w-full border rounded px-3 py-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="pass"
            />
          </div>
          <Button type="submit">Authenticate</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="space-x-2">
          <Button
            variant="secondary"
            onClick={() => {
              setBasicToken(null);
            }}
          >
            Sign out
          </Button>
          <Button
            onClick={() => {
              fetchCampaigns();
              fetchUsers();
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Campaigns */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Campaigns</h2>
          <div className="space-x-2">
            <Button
              variant="secondary"
              onClick={() => setCampPage(Math.max(1, campPage - 1))}
            >
              Prev
            </Button>
            <span className="text-sm">Page {campPage}</span>
            <Button
              variant="secondary"
              onClick={() => setCampPage(campPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
        <div className="overflow-auto border rounded">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Creator</th>
                <th className="p-2 text-left">Verified</th>
                <th className="p-2 text-left">Active</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c._id} className="border-t">
                  <td className="p-2">{c.title}</td>
                  <td className="p-2">{c.creator?.name || "—"}</td>
                  <td className="p-2">
                    {c.verification?.isVerified ? "Yes" : "No"}
                  </td>
                  <td className="p-2">{c.isActive ? "Yes" : "No"}</td>
                  <td className="p-2 space-x-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          await adminApproveCampaign(c._id, authed);
                          toast({ type: "success", title: "Approved" });
                          fetchCampaigns();
                        } catch (e: any) {
                          toast({
                            type: "error",
                            title: "Approve failed",
                            description: e.message,
                          });
                        }
                      }}
                    >
                      Approve
                    </Button>
                    {c.isActive ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          try {
                            await adminDeactivateCampaign(c._id, authed);
                            toast({ type: "success", title: "Deactivated" });
                            fetchCampaigns();
                          } catch (e: any) {
                            toast({
                              type: "error",
                              title: "Deactivate failed",
                              description: e.message,
                            });
                          }
                        }}
                      >
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          try {
                            await adminActivateCampaign(c._id, authed);
                            toast({ type: "success", title: "Activated" });
                            fetchCampaigns();
                          } catch (e: any) {
                            toast({
                              type: "error",
                              title: "Activate failed",
                              description: e.message,
                            });
                          }
                        }}
                      >
                        Activate
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Users */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Users</h2>
          <div className="space-x-2">
            <Button
              variant="secondary"
              onClick={() => setUserPage(Math.max(1, userPage - 1))}
            >
              Prev
            </Button>
            <span className="text-sm">Page {userPage}</span>
            <Button
              variant="secondary"
              onClick={() => setUserPage(userPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
        <div className="overflow-auto border rounded">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Locked</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2">{u.isLocked ? "Yes" : "No"}</td>
                  <td className="p-2 space-x-2">
                    {u.isLocked ? (
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            await adminUnlockUser(u._id, authed);
                            toast({ type: "success", title: "Unlocked" });
                            fetchUsers();
                          } catch (e: any) {
                            toast({
                              type: "error",
                              title: "Unlock failed",
                              description: e.message,
                            });
                          }
                        }}
                      >
                        Unlock
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            await adminLockUser(u._id, authed);
                            toast({ type: "success", title: "Locked" });
                            fetchUsers();
                          } catch (e: any) {
                            toast({
                              type: "error",
                              title: "Lock failed",
                              description: e.message,
                            });
                          }
                        }}
                      >
                        Lock
                      </Button>
                    )}
                    <Button
                      className="text-white"
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        if (!confirm("Delete user? This cannot be undone."))
                          return;
                        try {
                          await adminDeleteUser(u._id, authed);
                          toast({ type: "success", title: "Deleted" });
                          fetchUsers();
                        } catch (e: any) {
                          toast({
                            type: "error",
                            title: "Delete failed",
                            description: e.message,
                          });
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminPage;
