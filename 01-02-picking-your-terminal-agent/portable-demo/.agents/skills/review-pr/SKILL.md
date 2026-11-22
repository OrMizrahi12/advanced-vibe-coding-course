---
name: review-pr
description: Audits a branch diff for failing tests, type errors,
  and leaked secrets before opening a pull request.
---

# Pull Request Readiness Checklist
1. Run `git diff main...HEAD --stat` to inspect changed files.
2. Execute `npm run verify` and report exact failing lines.
3. Scan staged changes for secrets or missing RLS policies.
4. Output a concise pass/fail table with file paths and fixes.
