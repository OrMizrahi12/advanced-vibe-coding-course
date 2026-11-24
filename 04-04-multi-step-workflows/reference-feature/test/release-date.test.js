import test from "node:test";
import assert from "node:assert/strict";
import { formatReleaseDate } from "../src/release-date.js";

test("formats valid YYYY-MM-DD release date in UTC", () => {
  assert.equal(formatReleaseDate("2026-11-22"), "Nov 22, 2026");
  assert.equal(formatReleaseDate("2026-01-05"), "Jan 05, 2026");
});

test("rejects malformed and impossible calendar dates", () => {
  assert.throws(() => formatReleaseDate("2026-02-30"), /Invalid calendar date/);
  assert.throws(() => formatReleaseDate("11/22/2026"), /Invalid ISO date/);
});
