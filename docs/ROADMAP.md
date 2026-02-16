# FundLoom Delivery Roadmap (Excluding Fiat)

## Phase A — Auth + Session Security
- Enforce backend-issued sessions for all login methods.
- Disable insecure fallback in production builds.
- Add token refresh, expiry, and revocation flows.
- Add auth event telemetry.

## Phase B — Campaign Lifecycle Stability
- Complete campaign moderation states and transitions.
- Add ownership and state invariants on update/delete.
- Add campaign update timeline feature.

## Phase C — Onchain Contribution Reliability
- Implement tx orchestration states and retries.
- Add chain confirmation reconciliation.
- Add operator tooling for stuck tx records.

## Phase D — Community + Trust
- Harden comments and abuse/reporting controls.
- Add campaign trust signals and transparency cards.
- Add public report exports and donor verification views.

## Phase E — Admin Operations
- Admin triage queue, escalation, assignment.
- Incident playbooks and postmortem workflow.
- User/campaign sanctions with audit trails.

## Phase F — Observability + Release Quality
- Service health dashboards and alerts.
- E2E suite for critical journeys.
- Release gating and rollback process.
