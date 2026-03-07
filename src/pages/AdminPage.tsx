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
  adminListReports,
  adminResolveReport,
  BasicAuth,
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

const AdminPage: React.FC = () => {
  const { show } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [basicToken, setBasicToken] = useState<string | null>(null);

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  const [campPage, setCampPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [reportPage, setReportPage] = useState(1);

  const authed: BasicAuth | null = useMemo(
    () => (basicToken ? { basicToken } : null),
    [basicToken]
  );

  const incidentSnapshot = useMemo(() => {
    const pendingReview = campaigns.filter(
      (c) => c?.verification?.isVerified === false
    ).length;
    const inactiveCampaigns = campaigns.filter((c) => c?.isActive === false).length;
    const lockedUsers = users.filter((u) => u?.isLocked).length;
    const openReports = reports.filter((r) => !["resolved", "rejected"].includes(String(r?.status || "open"))).length;
    return { pendingReview, inactiveCampaigns, lockedUsers, openReports };
  }, [campaigns, users, reports]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = btoa(`${username}:${password}`);
      setBasicToken(token);
      show({
        type: "success",
        title: "Admin Auth",
        description: "Authenticated",
      });
    } catch {
      show({
        type: "error",
        title: "Admin Auth",
        description: "Failed to encode credentials",
      });
    }
  };

  const fetchCampaigns = async () => {
    if (!authed) return;
    try {
      const res = await adminListCampaigns({ page: campPage, limit: 25 }, authed);
      if (res.success && (res as any).data) {
        setCampaigns((res as any).data.campaigns || []);
      }
    } catch (e: any) {
      show({ type: "error", title: "Fetch campaigns", description: e.message });
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
      show({ type: "error", title: "Fetch users", description: e.message });
    }
  };

  const fetchReports = async () => {
    if (!authed) return;
    try {
      const res = await adminListReports({ page: reportPage, limit: 25, status: "open" }, authed);
      if (res.success && (res as any).data) {
        setReports((res as any).data.reports || []);
      }
    } catch (e: any) {
      show({
        type: "warning",
        title: "Reports endpoint unavailable",
        description: e?.message || "No reports feed yet on backend.",
      });
      setReports([]);
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

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, reportPage]);

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
          <Button variant="secondary" onClick={() => setBasicToken(null)}>
            Sign out
          </Button>
          <Button
            onClick={() => {
              fetchCampaigns();
              fetchUsers();
              fetchReports();
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">Incident Snapshot</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="border rounded-lg p-4 bg-card">
            <div className="text-xs text-muted-foreground">Pending campaign reviews</div>
            <div className="text-2xl font-semibold mt-1">{incidentSnapshot.pendingReview}</div>
          </div>
          <div className="border rounded-lg p-4 bg-card">
            <div className="text-xs text-muted-foreground">Inactive campaigns</div>
            <div className="text-2xl font-semibold mt-1">{incidentSnapshot.inactiveCampaigns}</div>
          </div>
          <div className="border rounded-lg p-4 bg-card">
            <div className="text-xs text-muted-foreground">Locked users</div>
            <div className="text-2xl font-semibold mt-1">{incidentSnapshot.lockedUsers}</div>
          </div>
          <div className="border rounded-lg p-4 bg-card">
            <div className="text-xs text-muted-foreground">Open abuse reports</div>
            <div className="text-2xl font-semibold mt-1">{incidentSnapshot.openReports}</div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Moderation Queue</h2>
          <div className="space-x-2">
            <Button variant="secondary" onClick={() => setReportPage(Math.max(1, reportPage - 1))}>Prev</Button>
            <span className="text-sm">Page {reportPage}</span>
            <Button variant="secondary" onClick={() => setReportPage(reportPage + 1)}>Next</Button>
          </div>
        </div>
        <div className="overflow-auto border rounded">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Reason</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Created</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td className="p-3 text-muted-foreground" colSpan={5}>
                    No moderation reports returned yet.
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r._id || r.id} className="border-t">
                    <td className="p-2">{r.entityType || r.type || "report"}</td>
                    <td className="p-2">{r.reason || "—"}</td>
                    <td className="p-2">{r.status || "open"}</td>
                    <td className="p-2">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="p-2 space-x-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            await adminResolveReport(String(r._id || r.id), { status: "resolved", resolutionNote: "Resolved via admin dashboard" }, authed);
                            show({ type: "success", title: "Report resolved", description: "Case closed as resolved." });
                            fetchReports();
                          } catch (e: any) {
                            show({ type: "error", title: "Resolve failed", description: e?.message || "Could not resolve report." });
                          }
                        }}
                      >
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          try {
                            await adminResolveReport(String(r._id || r.id), { status: "rejected", resolutionNote: "Rejected by admin review" }, authed);
                            show({ type: "success", title: "Report rejected", description: "Case closed as rejected." });
                            fetchReports();
                          } catch (e: any) {
                            show({ type: "error", title: "Reject failed", description: e?.message || "Could not reject report." });
                          }
                        }}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Campaigns</h2>
          <div className="space-x-2">
            <Button variant="secondary" onClick={() => setCampPage(Math.max(1, campPage - 1))}>Prev</Button>
            <span className="text-sm">Page {campPage}</span>
            <Button variant="secondary" onClick={() => setCampPage(campPage + 1)}>Next</Button>
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
                  <td className="p-2">{c.verification?.isVerified ? "Yes" : "No"}</td>
                  <td className="p-2">{c.isActive ? "Yes" : "No"}</td>
                  <td className="p-2 space-x-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          await adminApproveCampaign(c._id, authed);
                          show({ type: "success", title: "Approved", description: "Campaign approved." });
                          fetchCampaigns();
                        } catch (e: any) {
                          show({ type: "error", title: "Approve failed", description: e.message });
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
                            show({ type: "success", title: "Deactivated", description: "Campaign has been deactivated." });
                            fetchCampaigns();
                          } catch (e: any) {
                            show({ type: "error", title: "Deactivate failed", description: e.message });
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
                            show({ type: "success", title: "Activated", description: "Campaign has been activated." });
                            fetchCampaigns();
                          } catch (e: any) {
                            show({ type: "error", title: "Activate failed", description: e.message });
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

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Users</h2>
          <div className="space-x-2">
            <Button variant="secondary" onClick={() => setUserPage(Math.max(1, userPage - 1))}>Prev</Button>
            <span className="text-sm">Page {userPage}</span>
            <Button variant="secondary" onClick={() => setUserPage(userPage + 1)}>Next</Button>
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
                            show({ type: "success", title: "Unlocked", description: "User has been unlocked." });
                            fetchUsers();
                          } catch (e: any) {
                            show({ type: "error", title: "Unlock failed", description: e.message });
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
                            show({ type: "success", title: "Locked", description: "User locked." });
                            fetchUsers();
                          } catch (e: any) {
                            show({ type: "error", title: "Lock failed", description: e.message });
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
                        if (!confirm("Delete user? This cannot be undone.")) return;
                        try {
                          await adminDeleteUser(u._id, authed);
                          show({ type: "success", title: "Deleted", description: "User deleted." });
                          fetchUsers();
                        } catch (e: any) {
                          show({ type: "error", title: "Delete failed", description: e.message });
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
