# Lesson 1.4: Headless Automation Mode (`agy -p`) — Turning an Agent Into a Unix Pipe

This lesson kit includes the exact 18-line `scripts/diff-check.sh` commit gate, the completed `lab-cli` calculator module (`src/calc.js`, `test/calc.test.js`), and a quick-reference cheat sheet for running Google Antigravity CLI (`agy`) non-interactively in shell pipelines, outer loops, and CI workflows.

## Learning Outcomes

1. Run single-shot non-interactive prompts and stream `stdin` directly into `agy -p`.
2. Parse deterministic `--output-format json` objects with `jq` (with `stderr` diagnostic isolation) and inspect real-time `--output-format stream-json` NDJSON events.
3. Enforce write authority explicitly using `--mode plan` (read-only) vs. `--mode accept-edits` (autonomous edits), and gate commits with real Unix exit codes (`0` / `1`).

## Core Vocabulary

| Term | Definition |
| --- | --- |
| **Headless mode (`-p`)** | Non-interactive single-run execution that writes clean output to `stdout`, keeps diagnostics on `stderr`, and returns to your shell with a Unix exit code. |
| **NDJSON (`stream-json`)** | Newline-delimited JSON events (`init`, `step_update`, `result`) emitted one self-contained JSON object per line in real time for outer loop monitors. |
| **Permission mode (`--mode`)** | Explicit execution policy declared upfront for unattended runs: `--mode plan` (strict read-only analysis) vs. `--mode accept-edits` (autonomous file edits). |

## `agy -p` Command Cheat Sheet

> **Flag ordering note:** Pass the prompt string immediately after `-p` (`agy -p "<prompt>" --mode ... --output-format ...`).

```bash
# 1. Single-shot headless prompt (default plain text on stdout) + check exit code
agy -p "Summarize src/calc.js in two sentences."
echo $?

# 2. Pipe stdin (staged git diff) straight into agy -p
git diff --cached | agy -p "Write a one-line conventional commit message."

# 3. Machine-readable JSON envelope piped cleanly into jq (stderr stays isolated)
agy -p "List all exported functions in src/calc.js." --output-format json | jq .

# 4. Extract deterministic telemetry fields with jq
agy -p "List all exported functions in src/calc.js." --output-format json \
  | jq '{status, turns: .num_turns, tokens: .usage.total_tokens}'

# 5. Live NDJSON streaming telemetry (init, tool calls, tool results, completion)
agy -p "Run the test suite and report results." --output-format stream-json

# 6. Strict read-only execution rail (refuses to edit files on disk)
agy -p "Add JSDoc comments to every exported function in src/calc.js." --mode plan
git diff src/calc.js

# 7. Intentional autonomous edit rail for scripts & loops
agy -p "Add concise JSDoc comments to src/calc.js and run npm test." --mode accept-edits
git diff --stat && npm test
```

## Using `scripts/diff-check.sh`

1. Make the script executable and run the unit test suite:

```bash
chmod +x scripts/diff-check.sh
npm test
```

2. Stage your changes and run the read-only commit gate:

```bash
git add src/calc.js test/calc.test.js
./scripts/diff-check.sh; echo "exit=$?"
```

3. Chain it directly ahead of `git commit` so non-zero exit codes block bad diffs automatically:

```bash
./scripts/diff-check.sh && git commit -m "feat(calc): add roundTo helper"
```

### Files Included

- `scripts/diff-check.sh` — Exact 18-line `set -euo pipefail` bash commit gate (`--mode plan --output-format json` + `jq` verdict parser returning `0` on `PASS` or `1` otherwise).
- `package.json` — Node ESM configuration (`node --test`).
- `src/calc.js` — Completed calculator module (`add`, `subtract`, `multiply`, `divide`, `percentage`, `clamp`, `roundTo`) with JSDoc comments.
- `test/calc.test.js` — Complete 7-test suite using Node's built-in `node:test` runner.
