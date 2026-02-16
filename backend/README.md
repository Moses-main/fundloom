# FundLoom Backend (Node.js + Express)

This is a lightweight backend scaffold for local/dev integration with the FundLoom frontend.

## Included routes

- `GET /api/v1/health`
- `POST /api/v1/auth/privy/verify`
- `GET /api/v1/auth/me`
- `GET /api/v1/campaigns`
- `POST /api/v1/campaigns`
- `POST /api/v1/donations/crypto/tx`
- `POST /api/v1/donations/crypto`

## Notes

- Current storage is in-memory for fast iteration.
- For production, replace `backend/src/store.js` with Postgres-backed repositories.
- This scaffold exists to unblock frontend/backend flow while database layer is introduced.
