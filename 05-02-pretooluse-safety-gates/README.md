# Lesson 5.2: `PreToolUse` Safety Gates & Argument Rewriting (`allow`, `deny`, `overwrite`)

Welcome to Lesson 5.2 of **Advanced Vibe Coding**. This kit includes the merged 18-line `.agents/hooks.json` (`lifecycle-tracer` + `safety-gate`), the verified 21-line `scripts/pretool-guard.py` safety gate and argument rewriter, the 5-case dry-run test harness (`scripts/test-pretool-guard.sh`), and the `PreToolUse` contract & forensic audit cheat sheet.

## Learning Outcomes

1. Block destructive shell commands (`rm -rf`, `git push --force`) and dual-vector `.env` secret access across both file-read tools and `run_command` before execution ever reaches disk.
2. Rewrite bare tool arguments cleanly using shallow-merge `overwrite` (turning `git status` into `git status --short --branch` automatically while Antigravity notifies the agent).
3. Verify hard-deny enforcement forensically by comparing `/tmp/guard-audit.jsonl` (`PreToolUse`) against `/tmp/hook-trace.jsonl` (`PostToolUse`).

## `PreToolUse` 4-Outcome Contract Cheat Sheet

| `decision` | Effect | Optional Fields | When to Use |
| --- | --- | --- | --- |
| `"allow"` | Permits tool execution immediately | `"overwrite": { "<argKey>": "<newVal>" }` | Safe commands or transparently normalized arguments |
| `"deny"` | Hard-blocks tool execution immediately (zero `PostToolUse` fired!) | `"reason": "..."` | Destructive commands (`rm -rf`, `git push --force`) & `.env` secret protection |
| `"ask"` | Prompts the user (respects "Always Allow" cache) | `"reason"`, `"permissionOverrides"` | Sensitive actions needing one-time approval |
| `"force_ask"` | Always prompts the user, ignoring cached permissions | `"reason"` | High-stakes deployments or migrations |

### Shallow-Merge `overwrite` Rules

- `"overwrite"` performs a **shallow, top-level merge** into `toolCall.args` before the tool runs.
- Always preserve the exact argument key present in `toolCall.args` (`CommandLine`, `commandLine`, or `command`).
- Antigravity automatically prefixes the tool output with a notice telling the agent which keys were rewritten so the conversation stays consistent.

## Included Files

- [`.agents/hooks.json`](./.agents/hooks.json) — Exact 18-line merged `lifecycle-tracer` + `safety-gate` config (`timeout: 5`).
- [`scripts/pretool-guard.py`](./scripts/pretool-guard.py) — Exact 21-line executable `PreToolUse` safety gate blocking `.env`, `rm -rf`, and `git push --force` while rewriting bare `git status`.
- [`scripts/test-pretool-guard.sh`](./scripts/test-pretool-guard.sh) — Executable 5-case local `stdin`/`stdout` dry-run harness verifying all 3 `deny`, 1 `overwrite`, and 1 `allow` responses.

## Reproducible Hands-On Walkthrough

> **Prerequisite:** Start from `/workspace/lab-hooks` cleanly committed on `main` (from Lesson 5.1, with `scripts/hook-logger.py` and `pass 4, fail 0`).

### 1. Install Hooks & Run the 5-Case Dry-Run Harness

```bash
cp .agents/hooks.json /workspace/lab-hooks/.agents/hooks.json
cp scripts/pretool-guard.py /workspace/lab-hooks/scripts/pretool-guard.py
chmod +x /workspace/lab-hooks/scripts/pretool-guard.py

# Verify JSON syntax and all 5 dry-run cases locally
python3 -m json.tool /workspace/lab-hooks/.agents/hooks.json > /dev/null && echo "HOOKS_JSON_OK"
./scripts/test-pretool-guard.sh
```

### 2. Run All Three Live `agy -p "<prompt>" --mode accept-edits` Proofs

```bash
cd /workspace/lab-hooks
echo 'DEMO_SECRET=not-a-real-secret' > .env
: > /tmp/guard-audit.jsonl && : > /tmp/hook-trace.jsonl

# Proof 1: Destructive rm -rf hard-deny + safe npm test recovery
agy -p "Test our active PreToolUse safety-gate by calling run_command with 'rm -rf /tmp/safety-gate-test'. When blocked, report the exact hook reason and run 'npm test'." \
  --mode accept-edits

# Proof 2: Dual-vector .env protection (file-read tool + cat .env both denied)
agy -p "Verify our PreToolUse secret guard: first try reading .env once with your file-read tool; if blocked, try 'cat .env' once via run_command; then stop and report why both attempts were denied without printing any secret." \
  --mode accept-edits

# Proof 3: Shallow-merge overwrite (bare git status -> git status --short --branch -> '## main')
agy -p "Run the exact shell command 'git status' via run_command with zero flags, and print its raw stdout verbatim." \
  --mode accept-edits
```

### 3. Dual-Log Forensic Comparison & Cleanup

```bash
echo "--- guard-audit (PreToolUse) ---" && \
jq -c '{rule, decision, tool}' /tmp/guard-audit.jsonl && \
echo "--- hook-trace (PostToolUse) ---" && \
jq -c 'select(.hookEventName=="PostToolUse") | {ev: .hookEventName, tool, step: .stepIdx}' /tmp/hook-trace.jsonl

# Trash dummy .env and commit hook changes cleanly on main
gio trash .env
git add .agents/hooks.json scripts/pretool-guard.py && \
  git commit -m "feat(hooks): add PreToolUse safety gate and argument rewriter"
```

## Safety Customization Recipes

- **Block direct pushes to `main`:** Extend `DANGER` with `|\bgit\s+push\s+origin\s+main\b`.
- **Protect additional secret files:** Extend `ENV_RE` with `|(\.pem|\.key|id_rsa)\b`.
- **Require confirmation on migrations:** Return `{"decision": "force_ask", "reason": "Confirm database migration command."}` for `supabase db push` or `prisma migrate deploy`.
