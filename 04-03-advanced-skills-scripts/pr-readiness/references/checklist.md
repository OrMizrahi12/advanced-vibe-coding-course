# PR Review Judgment Rubric

Consult this rubric ONLY after `scripts/verify_env.sh` completes.
Deterministic facts come from the script; use this checklist for judgment.

## 1. Public API & Breaking Changes
- Flag removed exports, renamed parameters, or changed error contracts.
- Confirm new helpers follow existing ESM export conventions in `src/`.

## 2. Test Coverage & Edge Cases
- Verify every new function in `src/` has matching tests in `test/`.
- Confirm at least one negative or empty-input edge case is asserted.

## 3. Hard Verdict Rule
- If `scripts/verify_env.sh` exits non-zero, verdict MUST be `VERDICT: BLOCKED`.
- Output `VERDICT: READY` ONLY when exit code is `0` AND Sections 1-2 pass.
