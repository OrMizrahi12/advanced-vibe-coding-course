import test from "node:test";
import assert from "node:assert/strict";
import { formatChangelogNote, isBreakingNote } from "../src/changelog-note.js";

test("formats scoped changelog note cleanly", () => {
  const line = formatChangelogNote("v1.2.1", "Add skill router", "cli");
  assert.equal(line, "- [v1.2.1] (cli) Add skill router");
});

test("detects breaking changelog marker", () => {
  assert.equal(isBreakingNote("BREAKING: drop legacy flag"), true);
  assert.equal(isBreakingNote("Add pr-readiness skill"), false);
});
