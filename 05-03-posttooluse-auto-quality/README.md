# Lesson 5.3: `PostToolUse` Auto-Quality Loops — Instant Format, Lint & Typecheck

Welcome to Lesson 5.3 of **Advanced Vibe Coding**. This kit includes the merged 3-hook `.agents/hooks.json` (`lifecycle-tracer` + `safety-gate` + `auto-quality`), the verified 52-line `scripts/posttool-quality.py` formatter, debug linter, and `tsc --noEmit` relay, the 4-assertion dry-run harness (`scripts/test-posttool-quality.sh`), and the sub-2-second hook latency & tool-swapping guide.

## Learning Outcomes

1. Pair `PostToolUse` (which runs silently after file edits and MUST return `{}`) with `PostInvocation` (which relays pending errors once via `injectSteps` + `terminationBehavior: "force_continue"`).
2. Keep synchronous quality hooks strictly under 2 seconds by calling `./node_modules/.bin/tsc --noEmit` directly (skipping `npm` wrapper overhead), filtering extensions early, capping diagnostics to 6 lines, and enforcing an explicit `timeout: 5`.
3. Watch `agy -p "<prompt>" --mode accept-edits` self-correct a `TS2322` return-type mismatch on the very next turn before moving on to tests.

## `PostToolUse` + `PostInvocation` Contract Cheat Sheet

| Hook Event | Structure in `hooks.json` | Required `stdout` | Role in Auto-Quality Loop |
| --- | --- | --- | --- |
| `PostToolUse` | Grouped (`matcher` + `hooks`) | `{}` (always empty JSON!) | Filter code extensions, format tabs/whitespace in-place, lint `/src/` for `console.log`/`debugger`, run direct `tsc --noEmit` (`timeout=4`), write `/tmp/quality-pending.txt` on failure |
| `PostInvocation` | Flat array (no `matcher`) | `{}` when clean, or `{"injectSteps": [{"systemMessage": {"systemMessage": "..."}}], "terminationBehavior": "force_continue"}` | Read and unlink `/tmp/quality-pending.txt` once so errors inject directly into the agent loop without repeating |

### Sub-2-Second Latency & Timeout Hygiene Rules

- **Skip non-code edits immediately:** Exit `{}` in <5 ms when the edited path is not in `{".js", ".ts", ".jsx", ".tsx"}` (e.g., `README.md` or `.json`).
- **Bypass `npm run` startup overhead:** Invoke `./node_modules/.bin/tsc --noEmit` directly rather than spawning `npm run typecheck`.
- **Double timeout guard:** Put `timeout=4` on `subprocess.run(...)` inside Python and `"timeout": 5` inside `.agents/hooks.json` so a hung tool never stalls the harness.
- **Cap output lines (`[:6]`):** Feed only the first 6 compiler diagnostics into `injectSteps` so error feedback never bloats Layer 3 context.

## Swapping in Biome, Ruff, or Prettier Cleanly

Replace the `fmt_lint(path)` and `tsc` calls in `scripts/posttool-quality.py` while keeping the exact same `PostToolUse` / `PostInvocation` contract:
- **Biome (JS/TS):** `["./node_modules/.bin/biome", "check", "--write", str(path)]`
- **Prettier + ESLint:** `["./node_modules/.bin/prettier", "--write", str(path)]` followed by targeted lint on `str(path)`
- **Ruff (Python):** Filter `EXTS = {".py"}` and run `["ruff", "check", "--fix", str(path)]` + `["ruff", "format", str(path)]`

## Included Files

- [`.agents/hooks.json`](./.agents/hooks.json) — Merged `lifecycle-tracer` + `safety-gate` + `auto-quality` config (`timeout: 5`).
- [`scripts/posttool-quality.py`](./scripts/posttool-quality.py) — Exact 52-line executable formatter, debug linter, `tsc --noEmit` checker, and `PostInvocation` relay.
- [`scripts/test-posttool-quality.sh`](./scripts/test-posttool-quality.sh) — Sandboxed 4-check dry-run harness verifying `.md` skip, formatting + lint + `TS2322` logging, `force_continue` relay, and clean drain.

## Reproducible Hands-On Walkthrough

> **Prerequisite:** Start from `/workspace/lab-hooks` cleanly committed on `main` (from Lesson 5.2, with `tsconfig.json` `checkJs: true`).

```bash
# 1. Test the hook script offline in a sandboxed temp workspace
./scripts/test-posttool-quality.sh

# 2. Install TypeScript & Node types, enable "types": ["node"], and add merged hooks inside /workspace/lab-hooks
cd /workspace/lab-hooks
npm install -D typescript @types/node
node -e 'const fs=require("fs"),p=JSON.parse(fs.readFileSync("package.json","utf8"));p.scripts.typecheck="tsc --noEmit";fs.writeFileSync("package.json",JSON.stringify(p,null,2)+"\n");const t=JSON.parse(fs.readFileSync("tsconfig.json","utf8"));t.compilerOptions.types=["node"];fs.writeFileSync("tsconfig.json",JSON.stringify(t,null,2)+"\n")'
cp <kit>/.agents/hooks.json .agents/hooks.json
cp <kit>/scripts/posttool-quality.py scripts/posttool-quality.py
chmod +x scripts/posttool-quality.py
python3 -m json.tool .agents/hooks.json > /dev/null && echo "HOOKS_JSON_OK"

# 3. Run live self-correction proof in agy -p "<prompt>" --mode accept-edits
: > /tmp/quality-hook.jsonl
python3 -c 'from pathlib import Path; Path("/tmp/quality-pending.txt").unlink(missing_ok=True)'
agy -p "We are testing our PostToolUse quality hook on src/pricing.js. Step 1: edit ONLY src/pricing.js to add exported applyCoupon(priceCents, code) with JSDoc @param {number} priceCents, @param {string} code, @returns {number} where code 'SAVE10' applies 10% off, deliberately returning formatUsd(applyDiscount(priceCents, 10)) (a string) with trailing spaces on that line so the hook catches the TS2322 mismatch, and stop editing for that turn so the hook responds. Step 2: once the hook reports TS2322, fix applyCoupon in src/pricing.js to return a number, then add one unit test for applyCoupon in test/pricing.test.js." \
  --mode accept-edits

# 4. Inspect sub-2s latency log and verify clean typecheck + 5 green tests
jq -c '.' /tmp/quality-hook.jsonl
npm run typecheck && npm test
```
