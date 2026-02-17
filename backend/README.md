# FundLoom Backend (Node.js + Express)

This is a lightweight backend scaffold for local/dev integration with the FundLoom frontend.

## Included routes

- `GET /api/v1/health`
- `POST /api/v1/auth/privy/verify`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/campaigns`
- `POST /api/v1/campaigns`
- `PATCH /api/v1/campaigns/:campaignId`
- `GET /api/v1/campaigns/:campaignId/updates`
- `POST /api/v1/campaigns/:campaignId/updates`
- `POST /api/v1/donations/crypto/tx`
- `POST /api/v1/donations/crypto`
- `POST /api/v1/campaigns/:campaignId/report`
- `POST /api/v1/comments/campaign/:campaignId/:commentId/report`
- `GET /api/v1/admin/reports`
- `PUT /api/v1/admin/reports/:reportId`

## Notes

- Current storage is in-memory for fast iteration.
- For production, replace `backend/src/store.js` with Postgres-backed repositories.
- Route contracts are documented in `docs/API_CONTRACTS.md`.
