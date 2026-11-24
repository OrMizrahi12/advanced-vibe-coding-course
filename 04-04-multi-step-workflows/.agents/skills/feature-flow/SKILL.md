---
name: feature-flow
description: >-
  Guides a scoped feature through four gated stages: Spec, Plan, Build,
  and Verify. Use when implementing a new helper, module, or feature
  requiring explicit checkpoints before edits.
---

# Feature Flow (4-Stage Gated Workflow)

Run these four stages strictly in order. Never skip a failing gate.

1. **SPEC:** Restate the goal, exact function signature, and 2 edge cases.
2. **PLAN GATE:** List exact target files (`src/` and `test/`). STOP and
   wait for explicit approval unless the prompt grants `AUTO_APPROVE`.
3. **BUILD:** Implement ONLY the approved files with zero unrelated edits.
4. **VERIFY GATE:** Run `npm test` and `git diff --stat`. Require zero test
   failures and only approved files changed; otherwise print `GATE: BLOCKED`.

End with a 4-row stage table and final line `FLOW_STATUS: VERIFIED` or
`FLOW_STATUS: BLOCKED`. Never claim passing tests without running them.
