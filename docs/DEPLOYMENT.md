# Deployment Guide

## Environments
- **Development**: local Vite + test backend.
- **Staging**: production-like config, test wallets.
- **Production**: hardened auth/session, observability, restricted admin access.

## Pre-deploy Checklist
- `npm run build` passes.
- Environment variables validated.
- Auth fallback disabled in production (`VITE_ALLOW_INSECURE_WALLET_SESSION=false`).
- Admin credentials and secrets rotated.
- Monitoring and alerting configured.

## Deployment Steps
1. Build and publish frontend artifact.
2. Apply environment config.
3. Run smoke tests (auth, campaign list, donate flow).
4. Verify dashboards and alerts.
5. Announce deployment.

## Rollback
- Keep previous artifact/version.
- Revert to previous stable release if auth, donation, or admin workflows fail.
