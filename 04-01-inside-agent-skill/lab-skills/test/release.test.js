import test from "node:test";
import assert from "node:assert/strict";
import { parseSemver, formatTag } from "../src/release.js";

test("parses valid semver strings", () => {
  assert.deepEqual(parseSemver("1.2.0"), { major: 1, minor: 2, patch: 0 });
});

test("formats canonical release tag", () => {
  assert.equal(formatTag("1.2.0"), "v1.2.0");
});

test("rejects malformed semver strings", () => {
  assert.throws(() => parseSemver("1.2"), /Invalid semver/);
});
