# Lesson 7.1: Loop Engineering — Inner Loops vs. Outer Loops Visualized

Welcome to Lesson 7.1 of **Advanced Vibe Coding**. This starter kit contains the zero-dependency FIFO task queue (`src/queue.js`, `test/queue.test.js`), structured backlog (`PRD.json`), durable disk log (`PROGRESS.md`), and the exact reproducible commands comparing an Inner Loop (`--continue`) against a stateless Outer Ralph Loop (fresh `agy -p` per story).

## Inner Loop vs. Outer Ralph Loop Decision Matrix

| Dimension | Inner Loop (`--continue`) | Outer Ralph Loop (Fresh `agy -p`) |
| --- | --- | --- |
| Session identity (`conversation_id`) | Single long-lived thread across stories | Brand-new `conversation_id` per story |
| Input token profile (`in_tok` / `cache_read`) | Climbs sharply each turn as prior diffs and tool logs accumulate in cached context | Stays flat near clean Turn 1 baseline |
| Source of truth | Chat transcript in RAM | Disk truth: `PRD.json`, `PROGRESS.md`, `git log`, `npm test` |
| Best fit | Interactive exploration, 2–3 tight fixes inside one task | Multi-story autonomous execution without context rot |

## Included Files

- [`package.json`](./package.json) & [`.gitignore`](./.gitignore)
- [`src/queue.js`](./src/queue.js) — Exact 20-line starter FIFO `createQueue()` baseline (`enqueue`, `dequeue`, `peek`, `size`).
- [`test/queue.test.js`](./test/queue.test.js) — Exact 19-line `node:test` baseline (`pass 2, fail 0`).
- [`PRD.json`](./PRD.json) — Exact 14-line 3-story backlog (`US-01` priority ordering, `US-02` retry cap & `deadLetters()`, `US-03` stats & CLI).
- [`PROGRESS.md`](./PROGRESS.md) — Exact 6-line durable disk progress log.

## Reproducible Inner vs. Outer Benchmark

> **CLI flag order note:** Always place the prompt string immediately after `-p`, followed by `--continue` (inner only), `--mode accept-edits`, and `--output-format json`.

### 1. Initialize the Baseline Repo

```bash
git init -b main && npm test | grep -E '^# (tests|pass|fail|duration_ms)' && git add -A && \
  git commit -m "feat(lab): init task-queue starter with PRD.json and PROGRESS.md"
```

### 2. Run the Inner Loop (`--continue` on Scratch Branch `exp/inner`)

```bash
git checkout -b exp/inner

# Turn 1: US-01 (priority ordering, higher priority first with FIFO tie-breaker)
agy -p "Read PRD.json, PROGRESS.md, src/queue.js, and test/queue.test.js. Implement ONLY US-01 (priority ordering: numeric priority default 0, higher priority dequeues first with FIFO tie-breaker), add 2 node:test cases in test/queue.test.js, run npm test until all tests pass, set US-01 passes:true in PRD.json, and append one concise verified line (under 85 chars) to PROGRESS.md. Reply in 3 short lines." \
  --mode accept-edits --output-format json > /tmp/inner-1.json

# Turn 2: US-02 (resuming the exact same conversation via --continue)
agy -p "Continue in this same session and implement US-02 from PRD.json in src/queue.js: add requeue(job, max=3) incrementing job.attempts and requeuing while attempts < max or moving exhausted jobs to deadLetters(), add 2 node:test cases in test/queue.test.js, run npm test until all tests pass, set US-02 passes:true in PRD.json, and append one concise verified line (under 85 chars) to PROGRESS.md. Reply in 3 short lines." \
  --continue --mode accept-edits --output-format json > /tmp/inner-2.json
```

### 3. Reset to `main` & Run Two Stateless Outer Iterations (Fresh `agy -p`)

```bash
git reset --hard HEAD && git checkout main && git branch -D exp/inner

PROMPT='Read PRD.json, PROGRESS.md, and git log -n 3 --oneline. Implement ONLY the first story with passes:false in src/queue.js, add 2 node:test cases in test/queue.test.js, run npm test until all tests pass, set that story passes:true in PRD.json, and append one concise verified line (under 85 chars) to PROGRESS.md. Reply in 3 short lines.'

# Outer Iteration 1 -> ships US-01 and commits atomically
agy -p "$PROMPT" --mode accept-edits --output-format json > /tmp/outer-1.json
npm test | grep -E '^# (tests|pass|fail)' && git add -A && git commit -m "feat(queue): US-01 priority ordering"

# Outer Iteration 2 -> exact same $PROMPT, zero --continue -> ships US-02
agy -p "$PROMPT" --mode accept-edits --output-format json > /tmp/outer-2.json
npm test | grep -E '^# (tests|pass|fail)' && git add -A && git commit -m "feat(queue): US-02 retry cap and dead-letter queue"
```

### 4. Compare All 4 Telemetry Rows Side by Side

```bash
jq -sc 'def r(l): {run:l, cid:(.conversation_id[0:8]), turns:.num_turns, in_tok:.usage.input_tokens, cache_read:.usage.cache_read_tokens}; (.[0]|r("inner_1")), (.[1]|r("inner_2")), (.[2]|r("outer_1")), (.[3]|r("outer_2"))' \
  /tmp/inner-1.json /tmp/inner-2.json /tmp/outer-1.json /tmp/outer-2.json
```

### Disk-Truth Checklist

- Every shipped story flips `"passes": true` in `PRD.json` only after `npm test` passes.
- Every outer iteration appends one verified line to `PROGRESS.md` and lands one atomic Git commit.
- `inner_1` and `inner_2` share one `cid` with climbing `in_tok` and `cache_read` (cached prior transcript re-read on every turn); `outer_1` and `outer_2` show two distinct `cid`s with flat baseline `in_tok` and `cache_read`.
