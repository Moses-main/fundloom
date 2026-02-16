# FundLoom Remaining Tasks (Non-Fiat Scope)

> This TODO tracks remaining production work for FundLoom and explicitly excludes fiat contribution implementation for now.

## 1) Auth & Session Hardening (carry-over)
- [ ] Enforce server-issued session tokens for all auth paths (wallet/social/email) with no insecure fallback in production.
- [ ] Implement refresh-token rotation + device/session revocation controls.
- [ ] Add CSRF/session protection for web auth surfaces where needed.
- [ ] Add comprehensive auth audit events (sign-in, failures, lockouts, resets, logout).
- [ ] Add role/permission matrix tests for user/admin actions.

## 2) Campaign Lifecycle Completion
- [ ] Finalize backend/frontend campaign schema contract (status, moderation reason, archive timestamps, EVM linkage).
- [ ] Add owner/admin lifecycle validation gates for every privileged action (UI + API parity).
- [ ] Add moderation-state UX consistency (pending/flagged/paused/archive messaging everywhere).
- [ ] Add campaign deactivation/reactivation edge-case handling and regression tests.
- [ ] Add campaign updates moderation workflow (approve/reject/edit visibility states).

## 3) Onchain Reliability (Non-Fiat)
- [ ] Add backend reconciliation worker/indexer for onchain donations (event confirmation + reorg handling).
- [ ] Implement idempotent tx ingestion and replay-safe donation finalization.
- [ ] Persist tx state machine server-side and expose status polling endpoint.
- [ ] Add chain mismatch recovery UX (retry/switch/explain) across all donation entry points.
- [ ] Add robust error taxonomy and user-facing failure reasons for wallet/tx failures.

## 4) Community & Trust
- [ ] Move anti-spam checks to backend with shared policy config (rate limits, heuristics, abuse signatures).
- [ ] Add report case lifecycle (open/triage/investigating/resolved/rejected) tied to admin queue.
- [ ] Add moderator notes and resolution history for reported campaigns/comments.
- [ ] Add user-facing transparency page for moderation outcomes where appropriate.
- [ ] Add abuse-rate monitoring and alert thresholds.

## 5) Admin Features (Track + Resolve Platform Issues)
- [ ] Build admin incident dashboard (auth failures, tx failures, moderation queue, API health).
- [ ] Implement case assignment, SLA timers, and escalation paths.
- [ ] Add campaign risk controls with auditable reasons (flag/pause/re-verify/remove/restore).
- [ ] Add user risk controls (warn/restrict/suspend/reinstate) with immutable audit logs.
- [ ] Add exportable incident/postmortem reports.

## 6) Observability, QA, and Release Readiness
- [ ] Add structured logging and request tracing across auth/campaign/donation/admin flows.
- [ ] Add metrics dashboards + alerts (latency, error rates, tx confirmation lag, moderation backlog).
- [ ] Add end-to-end tests for critical journeys (auth, create campaign, donate crypto, report abuse, admin resolution).
- [ ] Add security test suite (auth/session misuse, permission bypass, abuse/report tampering).
- [ ] Add production release checklist + rollback runbook + on-call handoff template.

## 7) Documentation & Developer Experience
- [ ] Keep README roadmap progress synchronized with completed phases.
- [ ] Add API contracts for new moderation/reporting endpoints.
- [ ] Add runbooks for tx reconciliation failures and moderation incidents.
- [ ] Add contribution standards for tests, lint baselines, and CI quality gates.
- [ ] Add environment validation script for required Vite/backend variables.

## Suggested Execution Order
1. Close remaining Auth hardening gaps.
2. Complete campaign lifecycle parity and moderation-state consistency.
3. Ship backend tx reconciliation + idempotent finalization.
4. Expand moderation into full admin case management.
5. Finalize observability, QA automation, and release controls.
