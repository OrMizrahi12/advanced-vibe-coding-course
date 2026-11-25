---
name: guard-check
description: >-
  Run a fast local guardrail audit on the workspace. Use when the user
  asks to run guard-check, verify repo readiness, or inspect active
  dev-guardrails checks before committing.
---

# Guard Check

Run these checks in order and report a concise pass or block verdict:

1. Check `git status -s` and flag any untracked `.env` or secret files.
2. Run `npm run typecheck` and confirm zero TypeScript errors.
3. Run `npm test` and confirm every unit test passes.
4. Confirm `.agents/plugins/dev-guardrails/hooks.json` sits at plugin root.
