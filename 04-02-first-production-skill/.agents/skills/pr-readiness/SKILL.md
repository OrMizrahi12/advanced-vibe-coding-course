---
name: pr-readiness
description: >-
  Reviews staged and branch git diffs for test coverage, secrets, and
  breaking changes. Use before opening a pull request or when asked if
  a branch is ready to merge.
---

# PR Readiness Check

Run these four deterministic checks in order against `main`:

1. **Branch Diff:** Run `git status -s` and `git diff --stat main...HEAD`
   to list every changed file and flag any untracked noise.
2. **Test Suite:** Run `npm test` and confirm every test passes cleanly.
3. **Hygiene Scan:** Inspect the branch diff (`git diff main...HEAD`) for
   hardcoded secrets, leftover `console.log` calls, or unresolved `TODO`s.
4. **Verdict Table:** Output ONLY a 4-row check table plus a final line
   `VERDICT: READY` (all pass) or `VERDICT: BLOCKED` (any failure).

Never invent pass results, skip failing tests, or edit files unless asked.
