# Lesson 2.5: Scriptable Tmux Automation — `send-keys`, `capture-pane` & Fleet Launchers

Welcome to Lesson 2.5 of **Advanced Vibe Coding**. This kit contains the exact executable 44-line fleet launcher (`scripts/launch-fleet.sh`), the exact 22-line programmatic status inspector (`scripts/fleet-status.sh`), and a complete command reference for scripting multi-agent `tmux` fleets.

## Learning Outcomes

1. Dispatch literal commands and agent prompts programmatically using `tmux send-keys -l --` followed by a separate `C-m` Enter keystroke.
2. Scrape live worker pane buffers into Unix pipes and AI summaries using `tmux capture-pane -p -t <target> -S -30`.
3. Author and run an idempotent 4-pane fleet launcher (`launch-fleet.sh`) using immutable `pane_id` handles (`-P -F '#{pane_id}'`) and inspect every worker automatically via `fleet-status.sh`.

## Core Vocabulary

| Term | Definition |
| --- | --- |
| **`tmux send-keys`** | Programmatically injects keystrokes or shell commands straight into any named `tmux` pane without switching focus. |
| **`tmux capture-pane`** | Dumps a pane's visible buffer and scrollback straight to stdout so scripts can parse live agent output. |
| **Fleet launcher** | An idempotent shell script that prepares worktrees, builds labeled `tmux` panes, and dispatches initial tasks in one command. |

## Included Files

- [`scripts/launch-fleet.sh`](./scripts/launch-fleet.sh) — Exact 44-line idempotent 2×2 fleet launcher (`has-session` guard, worktree check/creation, immutable `pane_id` splits, literal `send-keys -l --` + `C-m` dispatch, `printf 'FLEET_%s\n'` completion marker).
- [`scripts/fleet-status.sh`](./scripts/fleet-status.sh) — Exact 22-line programmatic status inspector (`tmux list-panes`, `capture-pane -p -t "$pid" -S -30`, exact `grep -qx` `FLEET_READY`/`FLEET_FAIL` checks, latest `pass N` count, aggregated summary).

## Primitives Cheatsheet

### 1. Safe Literal Dispatch (`tmux send-keys -l --` + Separate `C-m`)

Always split text injection from Enter submission so `tmux` never misinterprets words like `Space` or `Enter` (or leading dashes) as key names or flags:

```bash
# 2-pane sandbox setup (assumes base-index 1 / pane-base-index 1 in ~/.tmux.conf)
tmux new -s demo
# Split vertically (Ctrl-b |), label Pane 1 "Worker" and Pane 2 "Controller"

# Basic dispatch into Pane 1 while staying in Pane 2
tmux send-keys -t demo:1.1 "npm test" C-m

# Safe literal dispatch (never swallows Space, Enter, quotes, or dashes)
tmux send-keys -t demo:1.1 -l -- 'echo "Space Enter ; ok"'
tmux send-keys -t demo:1.1 C-m
```

### 2. Live Buffer Scraping (`tmux capture-pane`) & Piping

```bash
# Dump the last 30 lines of Pane 1 to stdout
tmux capture-pane -p -t demo:1.1 -S -30

# Filter pass/fail lines with standard Unix pipes
tmux capture-pane -p -t demo:1.1 -S -30 | grep -E 'pass|fail' | tail -n 2

# Pipe captured pane scrollback straight into agy -p for a live one-line summary
tmux capture-pane -p -t demo:1.1 -S -30 | xargs -0 -I{} agy -p "One-line status of this pane: {}"

# Clean up the temporary sandbox
tmux kill-session -t demo
```

### 3. Immutable `pane_id` Handles & Exact Marker Pattern

- Capture permanent `%N` IDs with `-P -F '#{pane_id}'` (`new-session -d ... -P -F "$F"`, `split-window ... -P -F "$F"`) so scripts work identically under zero-based or one-based `tmux` configs.
- Emit completion markers using `printf 'FLEET_%s\n' READY` (rather than `echo FLEET_READY`) so the literal command line never false-matches `grep -qx "FLEET_READY"` before execution finishes.
- Keep `agy -p` flag order exact: `agy -p '<prompt>, no plan file' --mode plan` (prompt immediately after `-p`, read-only `--mode plan` so feature branches stay spotless).

## Running the Fleet Scripts

Copy `scripts/` into your `/workspace/fleet-demo/` repository and mark both scripts executable:

```bash
cd /workspace/fleet-demo
chmod +x scripts/launch-fleet.sh scripts/fleet-status.sh

# Syntax & permissions gate
bash -n scripts/launch-fleet.sh scripts/fleet-status.sh && ls -la scripts/

# Commit scripts cleanly on main
git add scripts/ && git commit -m "chore: add tmux fleet scripts"

# 1. Launch the 4-pane 2x2 fleet in one command
./scripts/launch-fleet.sh
# Output: Fleet 'fleet' ready.

# 2. Prove idempotency (second run exits 0 with zero duplicates)
./scripts/launch-fleet.sh
# Output: Session 'fleet' is already running.

# 3. Attach to the 2x2 HUD (cursor parks in 4: Monitor)
tmux attach -t fleet

# 4. Inside 4: Monitor, inspect all workers programmatically
./scripts/fleet-status.sh
# Output:
# === FLEET STATUS (fleet) ===
# [1] API Agent  | READY   | pass 2
# [2] UI Agent   | READY   | pass 2
# [3] Test Agent | READY   | pass 5
# Summary: 3/3 ready, 0 failed

# 5. Confirm all 4 worktrees stay clean
git worktree list && git status -s
```
