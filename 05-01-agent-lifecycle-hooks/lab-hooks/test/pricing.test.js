import test from "node:test";
import assert from "node:assert/strict";
import { applyDiscount, formatUsd } from "../src/pricing.js";

test("applyDiscount computes 20% off cleanly", () => {
  assert.equal(applyDiscount(2500, 20), 2000);
});
test("applyDiscount keeps 0% price unchanged", () => {
  assert.equal(applyDiscount(1999, 0), 1999);
});
test("applyDiscount rejects out-of-range percent", () => {
  assert.throws(() => applyDiscount(1000, 120), RangeError);
});
test("formatUsd renders two decimal places", () => {
  assert.equal(formatUsd(2000), "$20.00");
});
