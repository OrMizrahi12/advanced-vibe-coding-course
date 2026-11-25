# Lesson 7.2: Backpressure Engineering — Deterministic Gates That Kill AI Slop

Welcome to Lesson 7.2 of **Advanced Vibe Coding**. This starter kit provides a fast, fail-fast 4-layer deterministic backpressure gate (`scripts/verify.sh`) combining TypeScript JS checking (`tsconfig.json`), a zero-dependency 5-rule policy linter (`scripts/lint-check.mjs`), native `node --test` unit tests, and an end-to-end runtime smoke test (`scripts/smoke.mjs`).

## 4-Layer Backpressure Design Checklist

1. **Order stages cheapest-first:** `1/4 typecheck` → `2/4 lint` → `3/4 unit` → `4/4 smoke`.
2. **Fail fast with zero noise:** Stop immediately on the first failing stage, strip green checkmark chatter, cap error traces to the first 10 actionable `file:line` lines, and emit `GATE_FAIL stage=<name> exit=<code>`.
3. **Keep total runtime under 5 seconds:** Fast gates (`< 2 s`) turn every agent iteration into a tight self-healing feedback loop.
4. **Never let agents weaken tests:** Verify `git diff --name-only test/` stays empty when self-healing production code regressions.

## Unified `npm run verify` Contract

Add `"verify": "bash scripts/verify.sh"` to `package.json` and `"verify": "npm run verify"` to `PRD.json`:

- **Success:** Prints all four `GATE_STAGE <n>/4 ... PASS (<ms>)` lines followed by `VERIFY_PASS total=<ms>` and exits `0`.
- **Failure:** Prints the failing stage, up to 10 compact diagnostic lines, and `GATE_FAIL stage=<name> exit=<rc> total=<ms>`, exiting non-zero immediately without running slower downstream stages.

## Included Files

- [`tsconfig.json`](./tsconfig.json) — 12-line `allowJs` + `checkJs` + `noEmit` TypeScript config checking `src/**/*.js`.
- [`scripts/lint-check.mjs`](./scripts/lint-check.mjs) — 20-line zero-dependency 5-rule policy checker (`no-console`, `no-debugger`, `no-todo`, `require-jsdoc`, `no-export`).
- [`scripts/smoke.mjs`](./scripts/smoke.mjs) — 20-line end-to-end priority + FIFO tie-break + `requeue`/`deadLetters` smoke suite.
- [`scripts/verify.sh`](./scripts/verify.sh) — 21-line executable 4-stage fail-fast unified verify gate.

## Drop Into Any Node / TypeScript Repo

```bash
npm install -D typescript
cp tsconfig.json <your-repo>/
mkdir -p <your-repo>/scripts
cp scripts/lint-check.mjs scripts/smoke.mjs scripts/verify.sh <your-repo>/scripts/
chmod +x <your-repo>/scripts/verify.sh
npm pkg set scripts.verify="bash scripts/verify.sh"
npm run -s verify
```

## Exact Fail-Fast `agy -p` Self-Heal Pipe

> **CLI flag order note:** Always place the prompt string immediately after `-p`, followed by `--mode accept-edits --output-format json`.

```bash
# Capture compact fail-fast GATE_FAIL diagnostics
npm run -s verify 2>&1 | tee /tmp/verify-fail.log; echo "EXIT=${PIPESTATUS[0]}"

# Pipe raw failure trace straight into headless agy -p for autonomous repair
cat /tmp/verify-fail.log | agy -p "Fix the failing verification gate from stdin in src/queue.js without modifying any test files, then run npm run -s verify until VERIFY_PASS exits 0. Reply in 3 short lines." \
  --mode accept-edits --output-format json > /tmp/self-heal.json

# Verify zero test tampering and green 4-stage VERIFY_PASS
git diff --name-only test/
npm run -s verify
```
