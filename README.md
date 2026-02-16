# FundLoom

FundLoom is a decentralized fundraising platform focused on transparent campaign creation and contribution tracking, with wallet-first onboarding and progressive Privy authentication (wallet, social, email).

> Scope note: this roadmap intentionally **excludes fiat contribution implementation** for now, per current product direction.

## Table of Contents
- [Vision](#vision)
- [Current State](#current-state)
- [Remaining Tasks (Production Readiness Backlog)](#remaining-tasks-production-readiness-backlog)
- [Architecture](#architecture)
- [Flow Diagrams](#flow-diagrams)
- [Admin Operations Scope](#admin-operations-scope)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Production Docs](#production-docs)

## Vision
- Empower creators to launch verifiable campaigns.
- Allow donors to contribute via crypto rails with auditable outcomes.
- Provide admin tooling for moderation, incident response, and platform health.

## Current State
- Frontend: React + TypeScript + Vite.
- Auth: Privy runtime integration and wallet flow present, with backend-verified wallet session hardening in place.
- Data: campaign/donation/comment flows still partially backend-dependent.
- Admin: basic admin pages exist, but require production hardening and expanded operational tooling.

## Remaining Tasks (Production Readiness Backlog)

## Roadmap Execution Progress

- ✅ **Phase 1 (started): Security & Auth Hardening**
  - ✅ Backend-verified wallet session enforcement by default.
  - ✅ JWT startup validation (`/auth/me`) and stale-session clearing.
  - ✅ Token expiry/refresh scheduling hooks added on the client.
  - ✅ Auth audit event hooks added (best-effort API logging).
- ✅ **Phase 2 (in progress): Core Campaign Lifecycle**
  - ✅ Standardized backend→frontend lifecycle status mapping (`pending_review`, `active`, `paused`, `completed`, `archived`, `flagged`).
  - ✅ Added lifecycle-aware campaign filtering in campaigns page.
  - ✅ Tightened owner/admin controls for campaign image management actions and backend-safe update IDs.
  - ✅ Added campaign updates timeline ingestion + owner/admin posting flow on report page.
  - ✅ Added owner/admin lifecycle controls (pause, reactivate, archive) in campaign report workflow.
- 🔄 **Phase 3 (started): Onchain Contribution Reliability (Non-fiat)**
  - ✅ Added donation transaction state machine UX (`initiated`, `wallet_prompt`, `pending`, `confirmed`, `failed`) in donation modal flow.
  - ✅ Added explicit chain/network guardrails with guided wallet network switching to configured EVM chain before submit.
  - ✅ Added best-effort backend crypto donation reconciliation hook using tx hash after on-chain submission.
- ⏳ Remaining Phase 3+ items pending.
- 🔄 **Phase 4 (started): Community & Trust**
  - ✅ Added discussion anti-spam controls (client-side suspicious-content checks, char limit, post cooldown).
  - ✅ Added campaign-level and comment-level abuse reporting actions wired to moderation API hooks.
- ⏳ Remaining Phase 4+ items pending.


### Phase 1 — Security & Auth Hardening
- [ ] Enforce server-issued session tokens for **all** auth paths (wallet/social/email) and disable insecure fallback in production.
- [ ] Add refresh-token rotation / session expiry policies.
- [ ] Add explicit CSRF/session protection strategy for web auth surfaces.
- [ ] Add auth audit logging (sign-in, sign-out, failures, lockouts).

### Phase 2 — Core Campaign Lifecycle
- [ ] Finalize campaign CRUD ownership checks and moderation states.
- [ ] Standardize backend-to-frontend campaign schema (IDs, status, evm metadata, verification state).
- [ ] Add campaign updates/timeline posts with moderation support.
- [ ] Add campaign archival/deactivation workflows.

### Phase 3 — Onchain Contribution Reliability (Non-fiat)
- [ ] Implement robust chain/network guardrails and chain switch UX.
- [ ] Add transaction state machine (initiated/pending/confirmed/failed).
- [ ] Add event indexing/reconciliation service for donation finalization.
- [ ] Add idempotent donation recording and replay handling.

### Phase 4 — Community & Trust
- [ ] Production-grade comments/discussions with anti-spam controls.
- [ ] Report/resolve workflows for abuse and fraudulent campaigns.
- [ ] Campaign transparency reports and donor-facing audit summaries.

### Phase 5 — Admin Features (Track + Resolve Platform Issues)
- [ ] Admin incident dashboard (auth failures, tx failures, moderation queue, API health).
- [ ] Admin case management (open, triage, assign, resolve, postmortem).
- [ ] User risk actions (warn/limit/suspend/reinstate) with full audit logs.
- [ ] Campaign risk controls (flag, pause, re-verify, remove) with reason tracking.

### Phase 6 — Observability, QA, and Release
- [ ] Add structured logging + request tracing across auth/campaign/donation flows.
- [ ] Add uptime/error dashboards + alerting.
- [ ] Add E2E coverage for auth, create campaign, donate, and admin workflows.
- [ ] Add release checklist + rollback runbook.

## Architecture

See full architecture in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

### High-Level Components
- **Frontend SPA**: routing, UI state, auth entry, campaign UX.
- **Auth Layer**: Privy runtime + backend verification/session issuance.
- **Backend API**: campaigns, donations, comments, admin controls.
- **Blockchain Layer**: transaction submission and confirmation.
- **Admin Control Plane**: moderation + issue resolution workflows.

## Flow Diagrams

### 1) Authentication Flow
```mermaid
flowchart LR
  U[User] --> A[Auth Page]
  A --> P[Privy Login Method\nWallet/Social/Email]
  P --> B[Backend Verify/Session Issue]
  B --> S[Persist auth_token/auth_user]
  S --> D[Dashboard/Campaign Access]
```

### 2) Campaign Contribution Flow (Non-fiat)
```mermaid
flowchart LR
  U[Donor] --> C[Select Campaign]
  C --> W[Wallet Transaction]
  W --> X[Chain Confirmation]
  X --> R[Record Donation + Update Stats]
  R --> T[Thank You + Report View]
```

### 3) Admin Issue Resolution Flow
```mermaid
flowchart LR
  E[Platform Event\nSpam/Abuse/Failure] --> Q[Admin Queue]
  Q --> I[Investigate]
  I --> A[Action\nWarn/Pause/Suspend/Resolve]
  A --> L[Audit Log]
  L --> C[Close Case]
```

## Admin Operations Scope

See [`docs/ADMIN_OPERATIONS.md`](docs/ADMIN_OPERATIONS.md) for:
- Incident tracking model
- Moderation SLA expectations
- Resolution workflow and audit requirements

## Project Structure

```txt
src/
  components/       UI components and feature widgets
  context/          Auth and app state providers
  lib/              API clients, runtime integrations, utilities
  pages/            Route-level pages
  services/         Service-layer logic
  types/            Shared TypeScript contracts
```

## Environment Variables

Use `.env.example` as template.

Important variables:
- `VITE_PRIVY_APP_ID`
- `VITE_PRIVY_JS_SDK_URL`
- `VITE_ALLOW_INSECURE_WALLET_SESSION` (dev-only fallback; keep `false` in production)
- `VITE_API_BASE_URL`
- `VITE_DEFAULT_CHAIN`
- `VITE_RPC_BASE_SEPOLIA`
- `VITE_RPC_BASE_MAINNET`
- `VITE_WALLETCONNECT_PROJECT_ID`

## Development

```bash
npm install
npm run dev
```

Production build:
```bash
npm run build
```

## Production Docs
- Architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Delivery roadmap: [`docs/ROADMAP.md`](docs/ROADMAP.md)
- Admin operations: [`docs/ADMIN_OPERATIONS.md`](docs/ADMIN_OPERATIONS.md)
- Deployment guide: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- Security policy: [`docs/SECURITY.md`](docs/SECURITY.md)
- Contributing guide: [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md)
- License: [`LICENSE`](LICENSE)
