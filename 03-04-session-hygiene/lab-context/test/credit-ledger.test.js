import test from "node:test";
import assert from "node:assert/strict";
import { applyStoreCredit, allocateCreditGrants } from "../src/credit-ledger.js";

test("applyStoreCredit applies partial credit and computes remaining due", () => {
  assert.deepEqual(applyStoreCredit(5000, 1500), {
    appliedCreditCents: 1500,
    remainingDueCents: 3500,
    unusedCreditCents: 0,
  });
});

test("applyStoreCredit floors remainingDueCents at zero for excess credit", () => {
  assert.deepEqual(applyStoreCredit(2500, 4000), {
    appliedCreditCents: 2500,
    remainingDueCents: 0,
    unusedCreditCents: 1500,
  });
});

test("applyStoreCredit throws RangeError on negative or non-integer cents", () => {
  assert.throws(() => applyStoreCredit(-100, 500), RangeError);
  assert.throws(() => applyStoreCredit(1000, -1), RangeError);
  assert.throws(() => applyStoreCredit(10.5, 500), RangeError);
});

test("allocateCreditGrants drains earliest-expiring grants first (FIFO)", () => {
  const grants = [
    { id: "g-late", remainingCents: 600, expiresAt: "2026-12-31" },
    { id: "g-soon", remainingCents: 400, expiresAt: "2026-11-30" },
  ];
  assert.deepEqual(allocateCreditGrants(750, grants, "2026-11-22"), {
    appliedCreditCents: 750,
    remainingDueCents: 0,
    allocations: [
      { id: "g-soon", usedCents: 400 },
      { id: "g-late", usedCents: 350 },
    ],
  });
});

test("allocateCreditGrants skips expired and zero-balance grants", () => {
  const grants = [
    { id: "g-expired", remainingCents: 1000, expiresAt: "2026-11-21" },
    { id: "g-empty", remainingCents: 0, expiresAt: "2026-12-01" },
    { id: "g-valid", remainingCents: 300, expiresAt: "2026-11-22" },
  ];
  assert.deepEqual(allocateCreditGrants(500, grants, "2026-11-22"), {
    appliedCreditCents: 300,
    remainingDueCents: 200,
    allocations: [{ id: "g-valid", usedCents: 300 }],
  });
});

test("allocateCreditGrants caps applied credit at invoice total", () => {
  const grants = [
    { id: "g-1", remainingCents: 2000, expiresAt: "2026-12-01" },
    { id: "g-2", remainingCents: 1500, expiresAt: "2026-12-15" },
  ];
  assert.deepEqual(allocateCreditGrants(1200, grants, "2026-11-22"), {
    appliedCreditCents: 1200,
    remainingDueCents: 0,
    allocations: [{ id: "g-1", usedCents: 1200 }],
  });
});

test("allocateCreditGrants does not mutate the caller grants array or objects", () => {
  const grants = [
    { id: "g-b", remainingCents: 500, expiresAt: "2026-12-20" },
    { id: "g-a", remainingCents: 500, expiresAt: "2026-12-01" },
  ];
  const snapshot = structuredClone(grants);
  allocateCreditGrants(700, grants, "2026-11-22");
  assert.deepEqual(grants, snapshot);
});
