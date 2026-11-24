import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const labDir = process.env.LAB_CONTEXT_DIR || "/workspace/lab-context";
const { calculateInvoice } = await import(
  pathToFileURL(path.join(labDir, "src/invoice.js")).href
);

test("VIP25 returns 0 below 10000 cents threshold", () => {
  const inv = calculateInvoice([{ priceCents: 9999, qty: 1 }], {
    coupon: "VIP25",
  });
  assert.equal(inv.discountCents, 0);
});

test("VIP25 applies 25% off and taxes AFTER discount", () => {
  const inv = calculateInvoice([{ priceCents: 12000, qty: 1 }], {
    coupon: "VIP25",
    taxRate: 0.08,
  });
  assert.equal(inv.discountCents, 3000);
  assert.equal(inv.taxCents, 720);
  assert.equal(inv.totalCents, 9720);
});

test("VIP25 enforces 5000 cents maximum discount cap", () => {
  const inv = calculateInvoice([{ priceCents: 30000, qty: 1 }], {
    coupon: "VIP25",
    taxRate: 0.08,
  });
  assert.equal(inv.discountCents, 5000);
  assert.equal(inv.taxCents, 2000);
  assert.equal(inv.totalCents, 27000);
});

test("invoice preserves exact integer-cent return keys", () => {
  const inv = calculateInvoice([{ priceCents: 12000, qty: 1 }], {
    coupon: "VIP25",
  });
  assert.deepEqual(Object.keys(inv).sort(), [
    "discountCents",
    "subtotalCents",
    "taxCents",
    "totalCents",
  ]);
  for (const v of Object.values(inv)) {
    assert.equal(Number.isInteger(v), true);
  }
});
