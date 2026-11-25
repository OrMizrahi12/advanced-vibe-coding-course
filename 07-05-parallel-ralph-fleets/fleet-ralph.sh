#!/usr/bin/env bash
set -euo pipefail
SESSION="${1:-ralph-fleet}"
MAX_ITERS="${2:-4}"
REPO="$(cd "$(dirname "$0")" && pwd)"
BASE="$(dirname "$REPO")"
ROLES=(metrics filter snapshot)

# 1. Idempotent guard: avoid duplicate fleet session
if tmux has-session -t "$SESSION" 2>/dev/null; then
  echo "Session '$SESSION' is already running."; exit 0
fi

# 2. Provision 3 isolated worktrees + scoped .ralph/ backlogs
for r in "${ROLES[@]}"; do
  dir="$BASE/wt-$r"; br="fleet/$r"
  if [ ! -d "$dir" ]; then
    if git -C "$REPO" show-ref -q "refs/heads/$br"; then
      git -C "$REPO" worktree add -q "$dir" "$br"
    else
      git -C "$REPO" worktree add -q "$dir" -b "$br"
    fi
  fi
  [ -e "$dir/node_modules" ] || ln -s "$REPO/node_modules" "$dir/node_modules"
  mkdir -p "$dir/.ralph" "$dir/logs"
  jq --arg r "$r" '.[$r]' "$REPO/backlogs/fleet.json" > "$dir/.ralph/PRD.json"
  printf '# %s progress\n' "$br" > "$dir/.ralph/PROGRESS.md"
  rm -f "$dir/logs/ralph-summary.jsonl"
done

# 3. Build 2x2 tmux fleet grid with immutable pane IDs
F='#{pane_id}'
P1=$(tmux new-session -d -x 98 -y 24 -s "$SESSION" -c "$BASE/wt-metrics" -P -F "$F")
P3=$(tmux split-window -v -t "$P1" -c "$BASE/wt-snapshot" -P -F "$F")
P2=$(tmux split-window -h -t "$P1" -c "$BASE/wt-filter" -P -F "$F")
P4=$(tmux split-window -h -t "$P3" -c "$REPO" -P -F "$F")
tmux select-pane -t "$P1" -T "metrics"
tmux select-pane -t "$P2" -T "filter"
tmux select-pane -t "$P3" -T "snapshot"
tmux select-pane -t "$P4" -T "dashboard"

# 4. Dispatch parallel Ralph loops + live board via send-keys -l
dispatch_ralph() {
  local cmd="PRD_FILE=.ralph/PRD.json PROGRESS_FILE=.ralph/PROGRESS.md"
  if [ -n "${AGY_BIN:-}" ]; then cmd="AGY_BIN=$AGY_BIN $cmd"; fi
  tmux send-keys -t "$1" -l -- "$cmd ./ralph.sh --max-iters $MAX_ITERS"
  tmux send-keys -t "$1" C-m
}
sleep 0.4
dispatch_ralph "$P1"; dispatch_ralph "$P2"; dispatch_ralph "$P3"
tmux send-keys -t "$P4" -l -- "./scripts/fleet-board.sh '$BASE'"
tmux send-keys -t "$P4" C-m
tmux select-pane -t "$P4"
printf "Fleet '%s' launched (3 worktrees, max-iters=%d).\n" "$SESSION" "$MAX_ITERS"
