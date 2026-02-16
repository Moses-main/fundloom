const nowIso = () => new Date().toISOString();

const state = {
  users: new Map(),
  campaigns: new Map(),
  cryptoTxByIdempotency: new Map(),
  cryptoTxByHash: new Map(),
};

let campaignSeq = 1;

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

export function createCampaign(input = {}, creator = null) {
  const id = String(campaignSeq++);
  const campaign = {
    _id: id,
    title: String(input.title || "Untitled Campaign"),
    description: String(input.description || ""),
    targetAmount: Number(input.targetAmount || 0),
    raisedAmount: 0,
    deadline: input.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
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

export function upsertCryptoTx(input = {}) {
  const idempotencyKey = String(input.idempotencyKey || "").trim();
  const txHash = String(input.txHash || "").trim().toLowerCase();

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
