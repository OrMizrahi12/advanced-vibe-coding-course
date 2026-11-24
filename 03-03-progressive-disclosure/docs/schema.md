# Database Schema & Migration Reference

## Tables (PostgreSQL 16)
```sql
CREATE TABLE invoices (
  id              UUID PRIMARY KEY,
  customer_id     UUID NOT NULL,
  coupon_code     TEXT,
  subtotal_cents  BIGINT NOT NULL CHECK (subtotal_cents >= 0),
  discount_cents  BIGINT NOT NULL DEFAULT 0,
  tax_cents       BIGINT NOT NULL CHECK (tax_cents >= 0),
  total_cents     BIGINT NOT NULL CHECK (total_cents >= 0),
  status          TEXT NOT NULL CHECK (status IN ('draft','issued')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE coupons (
  code            TEXT PRIMARY KEY,
  kind            TEXT NOT NULL CHECK (kind IN ('percent','flat')),
  value           INTEGER NOT NULL CHECK (value > 0),
  min_subtotal    BIGINT NOT NULL DEFAULT 0,
  max_discount    BIGINT
);

CREATE TABLE refunds (
  id              UUID PRIMARY KEY,
  invoice_id      UUID NOT NULL REFERENCES invoices(id),
  refund_cents    BIGINT NOT NULL CHECK (refund_cents > 0),
  reason          TEXT NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL,
  ledger_seq      BIGSERIAL UNIQUE NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Indexes & Constraints
- `idx_invoices_customer_created` on `invoices (customer_id, created_at)`
- `idx_refunds_invoice_created` on `refunds (invoice_id, created_at)`
- Monetary columns use integer `BIGINT` cents; never `FLOAT` or `NUMERIC`.
- Refund rows are append-only; never `UPDATE` or `DELETE` posted rows.

## Migration Policy (`billing_migrations`)
- Follow expand-then-contract: add nullable column, backfill, enforce.
- Every migration is idempotent with a verified rollback script.
- Never rename or drop live columns inside a single deploy window.
