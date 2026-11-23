import test from "node:test";
import assert from "node:assert/strict";
import { add, subtract, multiply, divide } from "../src/calc.js";

test("basic arithmetic", () => {
  assert.equal(add(2, 3), 5);
  assert.equal(subtract(9, 4), 5);
  assert.equal(multiply(6, 7), 42);
  assert.equal(divide(20, 4), 5);
});

test("divide rejects zero", () => {
  assert.throws(() => divide(10, 0), /Division by zero/);
});
