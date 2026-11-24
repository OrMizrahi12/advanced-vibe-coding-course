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
   with `bash .agents/skills/pr-readiness/scripts/verify_env.sh` and
   capture its exact status lines and exit code (`0` or `1`).
2. **Judgment Rubric:** Open [checklist.md](./references/checklist.md)
   and review `git diff main...HEAD` for breaking exports and edge-case
   test coverage.
3. **Hard Gate Rule:** NEVER report `VERDICT: READY` if `verify_env.sh`
   exits non-zero. Output a 4-row table plus `VERDICT: READY` or
   `VERDICT: BLOCKED`. Never edit files unless asked.
