# Testing & Fixture Conventions Reference

## Test Runner & Layout
- Use Node native `node:test` and `node:assert/strict` via `npm test`.
- Zero external test packages (no Jest, Vitest, or Chai).
- Mirror source paths under `test/`: e.g. `test/refund-handler.test.js`.
- Keep every `test(...)` block isolated with zero shared mutable state.

## Frozen Fixtures & Deterministic Clock
- Define `FIXED_NOW_ISO = "2026-11-22T00:00:00Z"` for timestamp inputs.
- Build inputs using a frozen factory helper:
```js
export function makeInvoiceFixture(overrides = {}) {
  return Object.freeze({
    invoiceId: "inv_test_001",
    subtotalCents: 10000,
    discountCents: 0,
    taxCents: 800,
    totalCents: 10800,
    createdAt: FIXED_NOW_ISO,
    ...overrides,
  });
}
```

## Mandatory Boundary Matrix (Money & Refunds)
1. Happy path: partial integer-cent refund (e.g. `2500` of `10000`).
2. Exact full balance: `refundCents === invoiceCents` -> `remaining: 0`.
3. Threshold edges: `9999` vs `10000` cent edges and zero-cent inputs.
4. Invalid inputs: `0`, `-100`, `12.5` (float), `NaN`, and strings.
5. Overdraft guard: `refundCents = invoiceCents + 1` returns
   `{ ok: false, data: null, error: { code, message } }` cleanly.

## Assertion & Scope Checklist
- Assert full envelope keys (`ok`, `data`, `error`) via `deepEqual`.
- Never assert against wall-clock `Date.now()` or random UUIDs.
- Verify `src/format.js` remains untouched after running `npm test`.
