# Lesson 7.4: Circuit Breakers, Cost Guards & Sandbox Safety for Unattended Loops

Welcome to Lesson 7.4 of **Advanced Vibe Coding**. This starter kit delivers the exact 123-line hardened `ralph.sh` outer loop with four deterministic tripwires, gitignored `logs/ralph-summary.jsonl` structured cost/status auditing, and honest `--sandbox` isolation guidance.

## Hardened Safety Guards & Exit Codes

| Guard | Trigger Condition | Action | Exit Code |
| --- | --- | --- | ---: |
| **Branch-Only Guard** | Running on `main`/`master` without `--allow-main` | Refuses immediately (`0` API calls, `0` tokens) | `2` |
| **Protected-Path Guard** | Agent creates/edits `.env*`, `ralph.sh`, or `scripts/verify.sh` | Deletes untracked hits, reverts tracked files **before** `verify.sh` runs | `4` |
| **2× Identical-Hash Breaker** | Two consecutive verify failures produce identical timing-normalized SHA-256 hash | Auto-reverts dirty edits (`git reset` + `git checkout -- .`) and halts | `3` |
| **Max-Iterations Budget** | `--max-iters N` (default `5`) exhausted before `PRD.json` completes | Writes `MAX_ITERS_REACHED` with `in_tok`/`out_tok` summary | `1` |
| **All Stories Passed** | Zero `passes: false` stories remain in `PRD.json` | Writes `RALPH_COMPLETE` summary | `0` |

## Included Files

- [`ralph.sh`](./ralph.sh) — Exact 123-line hardened `set -euo pipefail` outer loop (`--max-iters`, `--sandbox`, `--allow-main`).
- [`.gitignore`](./.gitignore) — Ignores `node_modules/`, `*.log`, and `logs/` so `logs/ralph-summary.jsonl` never dirties `git status -s`.
- [`ralph-summary.example.jsonl`](./ralph-summary.example.jsonl) — Sample NDJSON summary ledger covering `CIRCUIT_BREAKER_TRIPPED`, `MAX_ITERS_REACHED`, and `RALPH_COMPLETE`.

## Offline Dry-Run Verification of All 4 Guards

> **CLI flag order contract:** Always pass `-p "$task"` first, then `--sandbox`, `--mode`, and `--output-format` (`"$AGY_BIN" -p "$task" "${agy_flags[@]}"`).

```bash
chmod +x ralph.sh
bash -n ralph.sh

# 1. Branch-Only Guard (run on main -> instant EXIT=2, 0 tokens)
./ralph.sh --max-iters 3; echo "EXIT=$?"

# 2. Protected-Path Guard (on a feature branch with a pending story)
cat > /tmp/tamper-agy.sh <<'EOF'
#!/usr/bin/env bash
echo "# bypass" >> scripts/verify.sh
echo "DEMO_KEY=placeholder" > .env
EOF
chmod +x /tmp/tamper-agy.sh
AGY_BIN=/tmp/tamper-agy.sh ./ralph.sh --max-iters 3; echo "EXIT=$?"
# Expect: CIRCUIT_BREAKER_TRIPPED reason=protected_path files=.env,scripts/verify.sh (EXIT=4)

# 3. 2x Identical-Hash Circuit Breaker (with a planted lint/test error)
AGY_BIN=true ./ralph.sh --max-iters 5; echo "EXIT=$?"
# Expect: streak=1/2 -> streak=2/2 -> CIRCUIT_BREAKER_TRIPPED reason=identical_failure_hash (EXIT=3)

# 4. Live --sandbox --mode plan Read-Only Audit Probe
agy -p "Read ralph.sh and list its 3 safety guards in 3 short plain lines (max 70 chars each). Do not edit files." \
  --sandbox --mode plan --output-format json > /tmp/sandbox-probe.json
jq -r '.response' /tmp/sandbox-probe.json
```

## Honest OS Sandboxing (`--sandbox`) + Trusted Outer Verification

- **Linux (`bubblewrap` / `bwrap`) & macOS (Seatbelt):** `--sandbox` isolates the agent process inside workspace-scoped OS boundaries. Always run `npm run -s verify` **outside** the sandbox in the trusted outer shell (`ralph.sh`) so the agent can never tamper with or spoof the verification gate.
- On restricted Linux environments where nested user namespaces limit shell execution inside `--sandbox`, use `--sandbox --mode plan` for read-only audits and run autonomous `--mode accept-edits` loops inside isolated branches backed by the 4 outer guards above.

## Auditing `logs/ralph-summary.jsonl` With `jq`

```bash
jq -r '"\(.status) | \(.reason) | br=\(.branch) it=\(.iters) cm=\(.commits) in=\(.in_tok) out=\(.out_tok)"' \
  logs/ralph-summary.jsonl
```
