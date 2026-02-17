# API Contracts (Node.js + Express Backend Scaffold)

This document defines the current backend contract expected by the FundLoom frontend.

Base URL: `http://localhost:5001/api/v1`

## Auth

### `POST /auth/privy/verify`
Request:
```json
{
  "sub": "did:privy:abc123",
  "name": "Alice",
  "email": "alice@example.com",
  "provider": "privy"
}
```
Response:
```json
{
  "success": true,
  "data": {
    "user": { "id": "did:privy:abc123", "name": "Alice", "email": "alice@example.com", "role": "user" },
    "token": "<backend-signed-token>"
  }
}
```

### `GET /auth/me`
Auth: `Authorization: Bearer <token>`

### `POST /auth/refresh`
Auth: `Authorization: Bearer <token>`

## Campaigns

### `GET /campaigns`
Returns campaigns list for frontend dashboard/listing.

### `POST /campaigns`
Auth: Bearer token

Request body (subset):
```json
{
  "title": "Save the Community Well",
  "description": "Help us restore water access",
  "targetAmount": 10000,
  "deadline": "2026-12-31T00:00:00.000Z"
}
```

### `PATCH /campaigns/:campaignId`
Auth: Bearer token

Request body (subset):
```json
{
  "isActive": false,
  "isArchived": false,
  "lifecycleStatus": "paused",
  "moderationReason": "Under review"
}
```

## Campaign Updates Timeline

### `GET /campaigns/:campaignId/updates`
Response:
```json
{
  "success": true,
  "data": {
    "updates": [],
    "pagination": { "page": 1, "limit": 20, "total": 0 }
  }
}
```

### `POST /campaigns/:campaignId/updates`
Auth: Bearer token

Request:
```json
{
  "title": "Milestone reached",
  "content": "We completed phase one."
}
```

## Donations (Crypto tx lifecycle)

### `POST /donations/crypto/tx`
### `POST /donations/crypto`
Both endpoints support upsert semantics for compatibility.

Request:
```json
{
  "campaignId": "1",
  "chainId": "84532",
  "state": "pending",
  "txHash": "0x...",
  "amountWei": "10000000000000000",
  "from": "0xabc...",
  "idempotencyKey": "uuid-v4",
  "message": "Great cause"
}
```

## Reporting + Moderation

### `POST /campaigns/:campaignId/report`
Auth: Bearer token

### `POST /comments/campaign/:campaignId/:commentId/report`
Auth: Bearer token

Request:
```json
{
  "reason": "spam",
  "details": "Suspicious links"
}
```

## Admin Reports

Admin auth uses basic auth headers:
- username: `ADMIN_BASIC_USER`
- password: `ADMIN_BASIC_PASS`

### `GET /admin/reports?status=open`

### `PUT /admin/reports/:reportId`
Request:
```json
{
  "status": "resolved",
  "resolutionNote": "Handled by moderator"
}
```

## Production note

Current backend storage is in-memory for scaffolding only.
Next milestone is Postgres-backed persistence and worker-based reconciliation.
