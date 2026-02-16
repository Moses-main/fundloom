# Backend Requirements (Do You Really Need a Backend?)

Short answer: **yes for production**, **optional for limited demo flows**.

FundLoom is designed as a hybrid frontend + blockchain + backend system to balance trust, cost, and UX.

## Why a backend is still needed

Even with smart contracts and wallet auth, production still needs a backend for:

- **Privy session bridge**
  - Convert wallet/social/email login into one server-issued app session/JWT.
  - Support account linking (same user across wallet + social/email).
- **Security + abuse controls**
  - Rate limits, anti-spam, moderation queues, abuse case lifecycle.
- **Operational reliability**
  - Donation reconciliation/indexing, idempotency, reorg handling, retries.
- **Offchain content storage**
  - Campaign descriptions, media, comments, moderation notes, analytics.
- **Admin operations**
  - Incident dashboards, report workflows, and audit trails.

## What can run without backend (limited mode)

You can run some flows without backend if your goal is only a blockchain demo:

- Wallet connect + chain switching.
- Contract reads/writes (create/donate/withdraw) if contract + RPC are configured.
- Basic tx status in UI from wallet lifecycle.

## What breaks without backend

Without backend, these product-critical features are unavailable or degraded:

- Privy-to-app session hardening and account linking.
- Moderation/reporting and admin queue actions.
- Reliable offchain campaign content and search/filter quality.
- Donation reconciliation and robust tx finalization history.

## Recommended architecture (production)

- **Onchain**: campaign ids, beneficiary, donation/withdraw value events, immutable proofs.
- **Offchain (backend/db)**: rich text/media/comments, moderation data, auth sessions, analytics, replay protection metadata.

This keeps gas cost low while preserving verifiability for financial actions.

## Decision matrix

| Capability | Frontend + Chain only | Frontend + Chain + Backend |
|---|---|---|
| Wallet donation | ✅ | ✅ |
| Privy wallet/social/email + unified app identity | ❌ | ✅ |
| Campaign rich content lifecycle | ⚠️ Partial | ✅ |
| Moderation & abuse reporting | ❌ | ✅ |
| Reconciliation / reorg safety | ❌ | ✅ |
| Production observability/audit trails | ❌ | ✅ |

## Practical recommendation

- Use **frontend + chain only** for local demos/hackathon prototypes.
- Use **frontend + backend + chain** for staging/production.
