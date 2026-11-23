import test from "node:test";
import assert from "node:assert/strict";
import {
  add,
  subtract,
  multiply,
  divide,
  percentage,
  clamp,
  roundTo,
} from "../src/calc.js";

test("basic arithmetic", () => {
  assert.equal(add(2, 3), 5);
  assert.equal(subtract(9, 4), 5);
  assert.equal(multiply(3, 4), 12);
  assert.equal(divide(10, 2), 5);
});

test("divide rejects zero", () => {
  assert.throws(() => divide(10, 0), /Division by zero/);
});

test("percentage calculates (value * pct) / 100", () => {
  assert.equal(percentage(200, 15), 30);
  assert.equal(percentage(50, 50), 25);
});

test("percentage rejects non-finite inputs", () => {
  assert.throws(() => percentage(Number.NaN, 10));
  assert.throws(() => percentage(100, Number.POSITIVE_INFINITY));
});

test("clamp bounds values within [min, max]", () => {
  assert.equal(clamp(12, 0, 10), 10);
  assert.equal(clamp(-5, 0, 10), 0);
  assert.equal(clamp(5, 0, 10), 5);
});

test("clamp rejects invalid range and non-finite inputs", () => {
  assert.throws(() => clamp(5, 10, 0));
  assert.throws(() => clamp(Number.NaN, 0, 10));
});

test("roundTo precision", () => {
  assert.equal(roundTo(3.14159, 2), 3.14);
  assert.equal(roundTo(2.555, 1), 2.6);
});
