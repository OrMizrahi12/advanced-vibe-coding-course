---
name: pr-readiness
description: >-
  Reviews staged and branch git diffs for test coverage, secrets, and
  breaking changes. Use before opening a pull request or when asked if
  a branch is ready to merge.
---

# PR Readiness Check
Run the deterministic validation gate FIRST before any prose review:

1. **Validation Gate:** Execute [verify_env.sh](./scripts/verify_env.sh)
   (or use the supplied gate output) and record all 5 checks + exit code.
2. **Judgment Rubric:** Open [checklist.md](./references/checklist.md)
   and inspect `git diff main...HEAD`. If the diff is empty or missing
   target changes, STOP and treat the branch as blocked.
3. **Hard Verdict Contract:** NEVER output `VERDICT: READY` if the gate
   exits non-zero OR if the diff is empty. Output a 5-row table, then
   end the final line with EXACTLY `VERDICT: READY` or `VERDICT: BLOCKED`
   with no markdown bolding or trailing prose. Never edit files.
