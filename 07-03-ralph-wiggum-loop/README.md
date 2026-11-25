# Lesson 7.3: Building Your First Ralph Wiggum Loop Around `agy -p`

Welcome to Lesson 7.3 of **Advanced Vibe Coding**. This starter kit includes the exact 55-line `ralph.sh` outer bash loop, 15-line stateless `PROMPT.md`, 20-line structured `PRD.json` backlog (with `US-03`–`US-05` pending so you can execute `./ralph.sh` immediately), and `PROGRESS.md`.

## Included Files

- [`ralph.sh`](./ralph.sh) — Exact 55-line `set -euo pipefail` outer loop with `jq` story selection, atomic `mktemp` + `mv` backlog updates, `--unbuffered` `stream-json` live telemetry formatting, `npm run -s verify` backpressure gating, `last-error.log` failure capture, atomic commits, and `RALPH_COMPLETE` exit.
- [`PROMPT.md`](./PROMPT.md) — Exact 15-line single-story stateless worker instructions banning agent edits to `PRD.json`, `PROGRESS.md`, or `git commit`.
- [`PRD.json`](./PRD.json) — Exact 20-line backlog template (`US-01`/`US-02` `true`, `US-03`/`US-04`/`US-05` `false`).
- [`PROGRESS.md`](./PROGRESS.md) — Durable disk progress log.

## Quick Start & Offline Dry-Run Probe

> **CLI flag order contract:** Inside `ralph.sh`, `"$AGY_BIN" -p "$task" --mode accept-edits --output-format stream-json` places the prompt immediately after `-p`. Placing `--mode` or `--output-format` before the prompt returns exit code `2`.

```bash
chmod +x ralph.sh
bash -n ralph.sh

# 1. Offline failure-gate dry run (proves broken code NEVER commits or flips passes:true)
AGY_BIN=true ./ralph.sh 1; echo "EXIT=$?"
cat /tmp/ralph/last-error.log

# 2. Run the live autonomous loop across all pending stories (default max 10 iterations)
./ralph.sh
```

## Inspecting Saved NDJSON Stream Telemetry (`/tmp/ralph/iter-*.ndjson`)

```bash
for f in /tmp/ralph/iter-*.ndjson; do
  jq -sr --arg f "$(basename "$f")" '
    (map(select(.event=="step_update"))|length) as $ev |
    (map(select(.event=="result")|.result//.)|last) |
    "\($f): cid=\((.conversation_id//"?")[0:8]) events=\($ev) turns=\(.num_turns) status=\(.status)"' "$f"
done
```

## Adaptation Checklist for Any Repository

1. Ensure `npm run -s verify` (or your repo's single fail-fast verify command) exits `0` cleanly and finishes in `< 5 s`.
2. Replace `src/ test/` in `git status -s src/ test/` with your repository's source and test roots.
3. Keep each story in `PRD.json` atomic (1 focused feature + deterministic acceptance criteria) and let `ralph.sh` exclusively own `PRD.json` state transitions and Git commits.
