# FundLoom Delivery Roadmap (Frontend + Blockchain, Non-Fiat)

## Phase A — Privy Auth + Session Integrity
- Ship Privy auth across wallet/social/email with unified identity linking.
- Ensure backend-issued sessions for all auth methods.
- Remove insecure auth fallbacks from production paths.
- Add auth security telemetry and lockout/risk controls.

## Phase B — Cost-Efficient Onchain Architecture
- Define strict onchain/offchain split to minimize gas:
  - onchain only for verifiable financial state and critical references
  - offchain for rich content and operational metadata
- Enforce stable campaign ID mapping (backend <-> chain).
- Add verification checks so frontend always surfaces canonical onchain references.

## Phase C — Campaign Lifecycle + Donation Reliability
- Complete lifecycle state parity across contract/backend/frontend.
- Add robust tx orchestration and donation state machine persistence.
- Implement chain event reconciliation + idempotent finalization.
- Add recovery workflows for failed/stuck/mismatched transactions.

## Phase D — Trust, Abuse Handling, and Transparency
- Move moderation anti-spam policy to backend with central configuration.
- Add report workflow lifecycle and moderator evidence trail.
- Add campaign trust indicators and donor transparency views.

## Phase E — Admin Operations Platform
- Expand incident dashboard for auth/tx/moderation/reconciliation health.
- Implement triage, assignment, SLA, escalation, and postmortem flows.
- Add user/campaign risk controls with immutable audit logs.

## Phase F — Observability, QA, and Release Quality
- Structured logs, traces, and alerting for critical app + chain flows.
- E2E suite for Privy auth, campaign creation, donations, and moderation/admin workflows.
- Security and resilience tests.
- Release gates, rollback runbook, and on-call operational docs.
