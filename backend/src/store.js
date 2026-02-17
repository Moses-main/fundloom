const nowIso = () => new Date().toISOString();

const state = {
  users: new Map(),
  campaigns: new Map(),
  campaignUpdates: new Map(), // campaignId -> update[]
  reports: new Map(), // reportId -> report
  cryptoTxByIdempotency: new Map(),
  cryptoTxByHash: new Map(),
};

let campaignSeq = 1;
let reportSeq = 1;
let updateSeq = 1;

export function upsertUserFromPrivy(payload = {}) {
  const sub = String(payload.sub || payload.userId || payload.did || "").trim();
  if (!sub) throw new Error("Missing Privy user identifier");

  const existing = state.users.get(sub);
  const user = {
    id: existing?.id || sub,
    name: payload.name || existing?.name || "FundLoom User",
    email: payload.email || existing?.email || "",
    role: existing?.role || "user",
    isVerified: true,
    providers: Array.from(new Set([...(existing?.providers || []), payload.provider || "privy"])),
    updatedAt: nowIso(),
    createdAt: existing?.createdAt || nowIso(),
  };

  state.users.set(sub, user);
  return user;
}

export function listCampaigns() {
  return Array.from(state.campaigns.values()).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getCampaignById(campaignId) {
  return state.campaigns.get(String(campaignId)) || null;
}

export function createCampaign(input = {}, creator = null) {
  const id = String(campaignSeq++);
  const campaign = {
    _id: id,
    title: String(input.title || "Untitled Campaign"),
    description: String(input.description || ""),
    targetAmount: Number(input.targetAmount || 0),
    raisedAmount: 0,
    deadline:
      input.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    isArchived: false,
    lifecycleStatus: "active",
    category: input.category || "general",
    image: input.image || null,
    creator: creator
      ? { _id: creator.id, name: creator.name, email: creator.email }
      : null,
    evm: input.evm || null,
    totalDonors: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  state.campaigns.set(id, campaign);
  return campaign;
}

export function patchCampaign(campaignId, input = {}) {
  const existing = getCampaignById(campaignId);
  if (!existing) return null;
  const next = {
    ...existing,
    isActive: input.isActive ?? existing.isActive,
    isArchived: input.isArchived ?? existing.isArchived,
    lifecycleStatus: input.lifecycleStatus ?? existing.lifecycleStatus,
    moderationReason: input.moderationReason ?? existing.moderationReason,
    updatedAt: nowIso(),
  };
  state.campaigns.set(String(campaignId), next);
  return next;
}

export function listCampaignUpdates(campaignId) {
  return (state.campaignUpdates.get(String(campaignId)) || []).slice();
}

export function createCampaignUpdate(campaignId, input = {}, author = null) {
  const update = {
    _id: String(updateSeq++),
    campaignId: String(campaignId),
    title: String(input.title || "Update"),
    content: String(input.content || ""),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    author: author ? { _id: author.id, name: author.name || "User" } : null,
    moderationStatus: "approved",
  };
  const list = state.campaignUpdates.get(String(campaignId)) || [];
  list.unshift(update);
  state.campaignUpdates.set(String(campaignId), list);
  return update;
}

export function createReport(input = {}) {
  const report = {
    _id: String(reportSeq++),
    type: String(input.type || "campaign"),
    campaignId: String(input.campaignId || ""),
    commentId: input.commentId ? String(input.commentId) : null,
    reason: String(input.reason || "other"),
    details: input.details ? String(input.details) : "",
    status: "open",
    resolutionNote: "",
    reporterId: input.reporterId || null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  state.reports.set(report._id, report);
  return report;
}

export function listReports(status = "") {
  const all = Array.from(state.reports.values()).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  if (!status) return all;
  return all.filter((r) => String(r.status) === String(status));
}

export function resolveReport(reportId, input = {}) {
  const existing = state.reports.get(String(reportId));
  if (!existing) return null;
  const next = {
    ...existing,
    status: input.status || existing.status,
    resolutionNote: input.resolutionNote || existing.resolutionNote || "",
    updatedAt: nowIso(),
  };
  state.reports.set(String(reportId), next);
  return next;
}

export function upsertCryptoTx(input = {}) {
  const idempotencyKey = String(input.idempotencyKey || "").trim();
  const txHash = String(input.txHash || "")
    .trim()
    .toLowerCase();

  if (idempotencyKey && state.cryptoTxByIdempotency.has(idempotencyKey)) {
    return state.cryptoTxByIdempotency.get(idempotencyKey);
  }

  if (txHash && state.cryptoTxByHash.has(txHash)) {
    const existing = state.cryptoTxByHash.get(txHash);
    const merged = {
      ...existing,
      ...input,
      txHash,
      updatedAt: nowIso(),
    };
    if (idempotencyKey) state.cryptoTxByIdempotency.set(idempotencyKey, merged);
    state.cryptoTxByHash.set(txHash, merged);
    return merged;
  }

  const record = {
    campaignId: String(input.campaignId || ""),
    chainId: String(input.chainId || ""),
    state: String(input.state || "pending"),
    txHash: txHash || null,
    from: input.from || null,
    amountWei: input.amountWei || null,
    message: input.message || null,
    errorMessage: input.errorMessage || null,
    idempotencyKey: idempotencyKey || null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  if (idempotencyKey) state.cryptoTxByIdempotency.set(idempotencyKey, record);
  if (txHash) state.cryptoTxByHash.set(txHash, record);
  return record;
}
