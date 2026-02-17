# FundLoom Remaining Tasks (Frontend + Blockchain, Non-Fiat Scope)

> Product direction: **Privy auth (wallet/social/email)** + **cost-efficient onchain state**.
> Keep rich/verbose data offchain; store only high-value verifiable records onchain.

## 1) Privy-Centric Authentication (Frontend + Backend Session Bridge)
- [ ] Complete Privy production wiring for wallet, social, and email in auth UI + callbacks.
- [ ] Ensure every login path resolves to a server-issued session/JWT (no insecure wallet fallback in prod).
- [ ] Add account-linking UX (same user across wallet + social/email identities).
- [ ] Add logout/session revocation across tabs/devices.
- [ ] Add auth telemetry for provider success/failure, lockouts, and abuse patterns.

## 2) Minimal-Onchain Data Model (Cost-Aware)
- [ ] Finalize what is stored onchain vs offchain:
  - onchain: campaign IDs, creator/beneficiary, funding state, withdrawal events, tx proofs
  - offchain: long text, media, comments, moderation notes, analytics
- [ ] Add deterministic linkage between backend campaign IDs and onchain campaign IDs.
- [ ] Add integrity checks so UI always displays verified onchain references for donations/campaigns.

## 3) Campaign Lifecycle (Frontend + Smart Contract + API)
- [ ] Finish lifecycle parity across frontend/backend/contract (`pending_review`, `active`, `paused`, `completed`, `archived`, `flagged`).
- [ ] Enforce owner/admin permissions consistently for lifecycle/media/update actions.
- [ ] Add moderation-aware campaign updates with approval/rejection states.
- [ ] Add end-to-end tests for archive/reactivate/flag flows.

## 4) Onchain Donation Reliability (ETH + USDC)
- [ ] Add backend indexer/reconciliation worker for donation events and reorg safety.
- [ ] Implement idempotent donation finalization and replay protection.
- [x] Persist tx state machine server-side (`initiated`, `wallet_prompt`, `pending`, `confirmed`, `failed`) via frontend upsert hooks (backend endpoint rollout in progress).
- [ ] Add robust chain mismatch recovery UX and retry guidance in frontend.

## 5) Trust, Reporting, and Moderation
- [ ] Move anti-spam logic from client-only checks to backend policy engine (rate limits + heuristics).
- [ ] Implement full abuse case lifecycle (open/triage/investigating/resolved/rejected).
- [ ] Add moderator notes, evidence links, and immutable action/audit trail.
- [ ] Add donor-facing trust/transparency surfaces (campaign health + resolution outcomes where appropriate).

## 6) Admin Operations (Issue Tracking + Resolution)
- [ ] Expand incident dashboard (auth failures, tx failures, reconciliation lag, moderation backlog, API health).
- [ ] Add assignment + SLA timers + escalation workflow.
- [ ] Add campaign risk controls (flag/pause/re-verify/remove/restore) with reason history.
- [ ] Add user risk controls (warn/restrict/suspend/reinstate) with audit logs.

## 7) Observability, QA, and Release Engineering
- [ ] Add structured logs + traces across auth, campaign, donation, and moderation flows.
- [ ] Add dashboards/alerts for chain confirmation lag and failed tx finalization.
- [ ] Add E2E coverage for critical journeys:
  - Privy auth (wallet/social/email)
  - create campaign (offchain + optional onchain sync)
  - donate ETH/USDC
  - report abuse + admin resolution
- [ ] Add security tests for auth/session misuse and permission bypass.
- [ ] Add release checklist + rollback runbook + on-call playbook.

## 8) Docs + Developer Experience
- [x] Add Node.js + Express backend scaffold with health/auth/campaigns/crypto-tx upsert routes for local integration.
- [ ] Keep README progress synchronized with implemented phase slices.
- [x] Publish API contracts for moderation/reports/reconciliation endpoints.
- [x] Add backend-vs-blockchain requirements matrix so contributors know which features require backend in production.
- [x] Add env validation script for required frontend + blockchain variables.
- [ ] Add contributor standards for lint/type/test gates and CI enforcement.

## Suggested Execution Order
1. Privy production auth + server session guarantees.
2. Minimal-onchain model + campaign ID linkage invariants.
3. Donation reconciliation + idempotent tx finalization.
4. Full moderation/admin case management.
5. Observability + E2E + release hardening.
