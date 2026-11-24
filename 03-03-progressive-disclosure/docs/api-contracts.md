# HTTP API Contracts Reference

## Required Request Headers
- `X-Request-Id`: UUID v4 trace token echoed in every response header.
- `X-Idempotency-Key`: Required on all `POST` mutations (24h window).
- `Content-Type`: Must be `application/json; charset=utf-8`.

## Response Envelope
All routes return the JSON envelope from `backend/AGENTS.md`:
- Success: `{ "ok": true, "data": { ... }, "error": null }`
- Failure: `{ "ok": false, "data": null, "error": { "code", "message" } }`

## Endpoint: POST /v1/invoices
- Body: `{ "customerId", "items": [{ "priceCents" }], "couponCode" }`
- `201 Created`: returns `invoiceId` and four integer-cent totals.

## Endpoint: POST /v1/refunds
- Headers: Requires both `X-Request-Id` and `X-Idempotency-Key`.
- Body: `{ "invoiceId", "refundCents", "reason" }`
- `201 Created`: `{ "refundId", "invoiceId", "remainingCents", "status" }`
- Replaying the same `X-Idempotency-Key` returns the cached `201` body.

## Canonical Error Codes
| HTTP | Code | Trigger Condition |
|---|---|---|
| `400` | `ERR_INVALID_CENTS` | `refundCents` non-integer or `<= 0` |
| `404` | `ERR_INVOICE_NOT_FOUND` | Unknown `invoiceId` |
| `409` | `ERR_REFUND_OVERDRAFT` | `refundCents` exceeds balance |
| `422` | `ERR_MISSING_IDEMPOTENCY` | Missing `X-Idempotency-Key` |

## Pagination Convention
- Cursor query: `?cursor=<opaque>&limit=20` (hard max `limit=50`).
- Response `data` includes `items` array and nullable `nextCursor`.
