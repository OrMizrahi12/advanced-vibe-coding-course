# Session Handoff: Store Credit Ledger

## Completed Work
- Milestone 1 committed on `main`: `applyStoreCredit` in `src/credit-ledger.js`
  and 3 passing tests in `test/credit-ledger.test.js` (`npm test`: 10 pass, 0 fail).

## Remaining Task (Milestone 2)
- Implement `allocateCreditGrants(invoiceTotalCents, grants, nowIso)` in `src/credit-ledger.js`.
- Drain active grants earliest `expiresAt` first; skip `expiresAt < nowIso` or `remainingCents <= 0`.
- Return `{ appliedCreditCents, remainingDueCents, allocations: [{ id, usedCents }] }`.
- Add 4 unit tests in `test/credit-ledger.test.js` (FIFO order, expired skip, cap, immutability).
- Mark Milestone 2 `[x]` in `PROGRESS.md`.

## Open Constraints & Invariants
- Integer cents only (`Number.isInteger`); throw `RangeError` on negative inputs.
- Never mutate caller `grants` array; leave `src/format.js` untouched; zero external deps.

## Exact Verification Command
- `npm test && node --check src/credit-ledger.js` (expect 14 pass, 0 fail).
