# Lesson 7.5: Parallel Ralph Fleets in Tmux — Autonomous Multi-Feature Execution

Welcome to Lesson 7.5 of **Advanced Vibe Coding**. This starter kit scales your hardened `ralph.sh` loop into a 3-worktree parallel `tmux` fleet with disjoint feature ownership (`metrics`, `filter`, `snapshot`), gitignored per-worktree `.ralph/` backlogs, a live 44-column polling dashboard (`scripts/fleet-board.sh`), conflict-free `--no-ff` merges, and clean `git worktree remove` teardown.

## Included Files

- [`fleet-ralph.sh`](./fleet-ralph.sh) — Exact 54-line parallel `tmux` + `git worktree` fleet launcher with idempotency guard, symlinked `node_modules`, gitignored `.ralph/` backlog seeding, immutable `pane_id` 2×2 grid, and literal `send-keys -l --` dispatch.
- [`scripts/fleet-board.sh`](./scripts/fleet-board.sh) — Exact 21-line compact 44-column live polling dashboard reading `.ralph/PRD.json`, `git rev-list`, and `logs/ralph-summary.jsonl` with automatic `READY` / `STOP` exit.
- [`ralph.sh`](./ralph.sh) — Exact 124-line worktree-scoped hardened outer loop supporting `PRD_FILE`, `PROGRESS_FILE`, and per-worktree `LOG_DIR`.
- [`backlogs/fleet.json`](./backlogs/fleet.json) — 3 disjoint feature backlogs × 2 stories = 6 stories (`MT-01/02`, `FL-01/02`, `SN-01/02`).
- [`PROMPT.md`](./PROMPT.md) & [`.gitignore`](./.gitignore) — Disjoint target-file worker instructions + symlink-safe `node_modules` (no trailing slash!) and `.ralph/` ignore rules.

## Quick Start & Fleet Navigation Cheat Sheet

```bash
chmod +x ralph.sh fleet-ralph.sh scripts/fleet-board.sh
bash -n ralph.sh fleet-ralph.sh scripts/fleet-board.sh

# 1. Launch 3 isolated worktrees + 2x2 tmux fleet (idempotent if re-run!)
./fleet-ralph.sh
git worktree list

# 2. Attach to watch Panes 1-3 execute live while Pane 4 polls to 3/3 READY
tmux attach -t ralph-fleet
```

| Tmux Key | Action |
| --- | --- |
| `Ctrl-b h` / `l` / `j` / `k` | Glide between `1: metrics`, `2: filter`, `3: snapshot`, and `4: dashboard` |
| `Ctrl-b z` | Zoom Pane 4 (`dashboard`) full-screen for audits, merges, and teardown |
| `Ctrl-b d` | Detach cleanly while all 3 Ralph loops continue autonomously |

## Offline Mock-Stub Dry Run (Zero Tokens)

You can dry-run the entire fleet harness offline by passing a custom `AGY_BIN=/path/to/mock-agy.sh` before running `./fleet-ralph.sh`:

```bash
AGY_BIN=/tmp/mock-agy.sh ./fleet-ralph.sh dryrun-fleet 4
tmux attach -t dryrun-fleet
```

> Inside `ralph.sh`, `"$AGY_BIN" -p "$task" "${agy_flags[@]}"` strictly passes the prompt immediately after `-p`, followed by `--mode accept-edits --output-format stream-json`.

## Zero-Conflict Merge & Plain Teardown Checklist

Once Pane 4 prints `FLEET: 3/3 done | 6/6 stories | READY`:

```bash
# 1. Confirm strictly disjoint file ownership across all 3 branches
for b in fleet/metrics fleet/filter fleet/snapshot; do
  echo "$b: $(git diff --name-only "main...$b" | tr '\n' ' ')"
done

# 2. Merge all 3 branches cleanly with --no-ff and re-run full 4-stage verify
for b in fleet/metrics fleet/filter fleet/snapshot; do
  git merge --no-ff -m "merge: integrate $b" "$b"
done
npm run -s verify && npm test

# 3. Clean teardown (plain git worktree remove, zero --force needed!)
for r in metrics filter snapshot; do
  git worktree remove "../wt-$r"
done
git worktree prune && git branch -d fleet/metrics fleet/filter fleet/snapshot
git worktree list && git status -s
```
