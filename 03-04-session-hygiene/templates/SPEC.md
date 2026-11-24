# Store Credit Ledger Specification

## Target Files & Global Invariants
- Module: `src/credit-ledger.js` · Tests: `test/credit-ledger.test.js`
- Integer cents only (`Number.isInteger`); throw `RangeError` on negative inputs.
- Zero external packages; pure ESM functions; never edit `src/format.js`.

## Milestone 1: `applyStoreCredit(invoiceTotalCents, availableCreditCents)`
- Apply up to `invoiceTotalCents`; floor `remainingDueCents` strictly at `0`.
- Return `{ appliedCreditCents, remainingDueCents, unusedCreditCents }`.
- Add 3 `node:test` cases (partial credit, excess credit floor, negative guard).

## Milestone 2: `allocateCreditGrants(invoiceTotalCents, grants, nowIso)`
- Each grant: `{ id, remainingCents, expiresAt }` (ISO date string).
- Drain grants earliest `expiresAt` first; skip `expiresAt < nowIso` or `<= 0`.
- Never mutate `grants`; return `{ appliedCreditCents, remainingDueCents, allocations }`.
- Each allocation entry: `{ id, usedCents }`.
- Add 4 `node:test` cases (FIFO expiry order, expired skip, partial cap, immutability).
