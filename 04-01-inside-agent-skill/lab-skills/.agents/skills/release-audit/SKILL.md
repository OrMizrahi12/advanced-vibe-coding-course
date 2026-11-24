---
name: release-audit
description: >-
  Audit a Node package before tagging a release: verify semver format,
  changelog entries, and passing tests. Use when the user asks to
  audit or verify release readiness.
---

# Release Audit

Always begin your audit output with the exact header:
`AUDIT_SOURCE: WORKSPACE_OVERRIDE`

## Procedure
1. Run the helper script: [check-version.sh](./scripts/check-version.sh)
2. Run `npm test` and confirm zero failing tests.
3. For edge cases, consult [release-policy.md](./references/release-policy.md).
4. Format the final output like [sample-report.md](./examples/sample-report.md).
