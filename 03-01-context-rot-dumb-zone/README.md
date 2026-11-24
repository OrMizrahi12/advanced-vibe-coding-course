# Lesson 3.1: Context Rot & The Dumb Zone — Why More Tokens Make Agents Worse

Welcome to Lesson 3.1 of **Advanced Vibe Coding**. This kit includes the exact zero-dependency `lab-context` invoice starter repository, the deterministic bloated-context benchmark harness (`benchmark/make-noise.mjs` and `benchmark/verify-vip.test.mjs`), the 4-layer context window cheat sheet, and the exact bloated-vs-pruned `agy -p` & `jq` telemetry commands.

## Learning Outcomes

1. Diagnose why bloated conversation history causes attention dilution and silent constraint bugs even when legacy repository tests stay green.
2. Map all four layers inside an agent context window and measure token waste directly with `--output-format json` and `jq`.
3. Apply the core **Context Engineering** rule: feed your agent the smallest set of high-signal tokens required for its exact next step.

## Core Vocabulary

| Term | Definition |
| --- | --- |
| **Context Engineering** | Curating the smallest set of high-signal tokens required for an agent's exact next step. |
| **Context rot** | Progressive accuracy loss as irrelevant logs, stale code, and conflicting notes pile up inside an agent's context window. |
| **Signal-to-noise ratio** | The share of active context tokens directly supporting the next step versus distracting history and raw tool dumps. |

## The 4-Layer Context Window Cheat Sheet

| Layer | Role | Behavior |
| --- | --- | --- |
| **01 · System Prompt & Rules** | Core harness instructions & repo memory (`AGENTS.md`) | Fixed overhead on every turn |
| **02 · Tool Schemas** | Shell, editor, and MCP tool definitions | Fixed overhead loaded every turn |
| **03 · Chat History & Raw Tool Outputs** | Stack traces, file dumps, dead-end retries & chat debates | **Balloons rapidly — main source of Context rot** |
| **04 · Active Task & Constraints** | Exact target files and current acceptance rules | **Pure signal — protect by pruning Layer 3** |

## Included Files

- [`lab-context/`](./lab-context/) — Exact zero-dependency Node ESM starter repository (`package.json`, 21-line `src/invoice.js`, 11-line untouched boundary module `src/format.js`, and 3-test baseline `test/invoice.test.js`).
- [`benchmark/make-noise.mjs`](./benchmark/make-noise.mjs) — Deterministic generator writing a 1,092-line (~88.7 KB) simulated 40-minute noisy session dump (`/tmp/bloated-context.txt`) with the real `VIP25` spec buried at the top and contradictory late-thread notes at the tail.
- [`benchmark/verify-vip.test.mjs`](./benchmark/verify-vip.test.mjs) — External strict 4-constraint acceptance verifier kept outside the repository so stale repo tests cannot hide silent billing drift (reads `/workspace/lab-context/src/invoice.js` by default, or set `LAB_CONTEXT_DIR=/path/to/lab-context`).

## Reproducible Bloated vs. Pruned Benchmark

### 1. Initialize `/workspace/lab-context` & Stage External Helpers

```bash
cp -r lab-context /workspace/lab-context
cp benchmark/make-noise.mjs /tmp/make-noise.mjs
cp benchmark/verify-vip.test.mjs /tmp/verify-vip.test.mjs

cd /workspace/lab-context
git init -b main
nl -ba src/invoice.js
npm test                                          # Expect: pass 3, fail 0
git add -A && git commit -m "init invoice lab starter"
```

### 2. Trigger & Diagnose Context Rot (Bloated Run)

> **CLI flag order note:** Always pass the prompt argument immediately after `-p`, followed by `--mode accept-edits --output-format json`.

```bash
# Generate the 1,092-line noisy session dump
node /tmp/make-noise.mjs
wc -l -c /tmp/bloated-context.txt
head -n 8 /tmp/bloated-context.txt && echo "---" && \
  tail -n 9 /tmp/bloated-context.txt

# Pipe the bloated transcript into agy -p and capture JSON telemetry
cat /tmp/bloated-context.txt | \
  agy -p "$(cat)
Finish the VIP25 refactor in src/invoice.js from the notes above and run npm test." \
  --mode accept-edits --output-format json > /tmp/run-bloated.json

# Inspect token usage
jq '{
  status, turns: .num_turns,
  input_tokens:  (.usage.input_tokens // .usage.prompt_tokens),
  output_tokens: (.usage.output_tokens // .usage.completion_tokens),
  total_tokens:  .usage.total_tokens
}' /tmp/run-bloated.json

# Legacy repo tests stay green, but the external strict verifier catches silent drift!
npm test
node --test /tmp/verify-vip.test.mjs
git diff src/invoice.js
```

### 3. Subtract via Git & Run the Fresh Pruned Session

```bash
# Instant subtraction reset
git checkout -- . && git status -s
ls src test

# Launch a clean session pinning ONLY src/invoice.js and test/invoice.test.js
agy -p \
  'Read ONLY src/invoice.js and test/invoice.test.js. Do NOT edit src/format.js.
Add coupon VIP25 to applyDiscount:
1) 25% off in integer cents (Math.round) ONLY when subtotalCents >= 10000, else 0.
2) Cap VIP25 discount at 5000 cents max.
3) Keep taxCents calculated AFTER discountCents and keep exact return keys.
4) Add 4 node:test cases in test/invoice.test.js covering below threshold,
   eligible, capped, and tax-after-discount, then run npm test.' \
  --mode accept-edits --output-format json > /tmp/run-clean.json
```

### 4. Compare Token Telemetry Side by Side & Verify Both Suites

```bash
jq -s '{
  bloated: (.[0].usage | {input_tokens, output_tokens, total_tokens}),
  clean:   (.[1].usage | {input_tokens, output_tokens, total_tokens})
}' /tmp/run-bloated.json /tmp/run-clean.json

# Independent diff and dual test verification
git diff --stat                                   # Only src/invoice.js & test/invoice.test.js
git diff src/invoice.js
npm test                                          # Expect: pass 7, fail 0
node --test /tmp/verify-vip.test.mjs              # Expect: pass 4, fail 0

# Commit verified refactor cleanly on main
git add src/invoice.js test/invoice.test.js && \
  git commit -m "feat(invoice): add VIP25 tiered coupon"
```

*Observed reference benchmark from the lesson run:*
- **Bloated run:** `47,771` `input_tokens` (`51,313` `total_tokens`) — failed strict `VIP25` acceptance checks.
- **Pruned run:** `13,403` `input_tokens` (`17,024` `total_tokens`) — **3.56× fewer input tokens** (**3.01× fewer total tokens**), `7/7` repo tests + `4/4` strict acceptance checks passing on turn 1.

### 5. Clean Up Temporary Benchmark Files

```bash
rm -f /tmp/bloated-context.txt /tmp/run-bloated.json /tmp/run-clean.json \
  /tmp/verify-vip.test.mjs /tmp/make-noise.mjs
```
