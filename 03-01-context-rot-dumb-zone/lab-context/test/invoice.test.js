import test from "node:test";
import assert from "node:assert/strict";
import { calculateInvoice } from "../src/invoice.js";
import { formatSummary } from "../src/format.js";

test("calculates subtotal and tax without coupon", () => {
  const inv = calculateInvoice([{ priceCents: 2500, qty: 2 }]);
  assert.deepEqual(inv, {
    subtotalCents: 5000,
    discountCents: 0,
    taxCents: 400,
    totalCents: 5400,
  });
  assert.equal(formatSummary(inv), "Total: $54.00");
});

test("applies SAVE10 discount before tax", () => {
  const inv = calculateInvoice([{ priceCents: 2500, qty: 2 }], {
    coupon: "SAVE10",
  });
  assert.equal(inv.discountCents, 500);
  assert.equal(inv.taxCents, 360);
  assert.equal(inv.totalCents, 4860);
});

test("floors FLAT500 discount at zero", () => {
  const inv = calculateInvoice([{ priceCents: 300, qty: 1 }], {
    coupon: "FLAT500",
  });
  assert.equal(inv.discountCents, 300);
  assert.equal(inv.totalCents, 0);
});
