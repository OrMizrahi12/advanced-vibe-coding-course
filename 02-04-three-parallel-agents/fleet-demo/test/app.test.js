import test from "node:test";
import assert from "node:assert/strict";
import { listTasks, getOpenCount } from "../src/api.js";
import { renderSummary, renderTaskList } from "../src/ui.js";

test("api lists seeded tasks and open count", () => {
  const items = listTasks();
  assert.equal(items.length, 2);
  assert.equal(getOpenCount(), 1);
});

test("ui renders summary and checklist", () => {
  const items = listTasks();
  assert.equal(renderSummary(items), "Tasks: 2 total, 1 open");
  assert.match(renderTaskList(items), /\[x\] Wire auth/);
});
