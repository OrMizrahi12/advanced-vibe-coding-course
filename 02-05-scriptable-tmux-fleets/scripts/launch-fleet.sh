#!/usr/bin/env bash
set -euo pipefail
S="${1:-fleet}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
BASE="$(dirname "$REPO")"

# 1. Idempotent guard: avoid duplicate fleet
if tmux has-session -t "$S" 2>/dev/null; then
  echo "Session '$S' is already running."; exit 0
fi

# 2. Ensure sibling worktrees exist cleanly
for role in api ui tests; do
  dir="$BASE/wt-$role" br="feat/$role"
  [ -d "$dir" ] && continue
  if git -C "$REPO" show-ref -q "refs/heads/$br"; then
    git -C "$REPO" worktree add "$dir" "$br"
  else
    git -C "$REPO" worktree add "$dir" -b "$br"
  fi
done

# 3. Build 2x2 grid with immutable pane IDs
F='#{pane_id}'
P1=$(tmux new-session -d -s "$S" -c "$BASE/wt-api" -P -F "$F")
P3=$(tmux split-window -v -t "$P1" -c "$BASE/wt-tests" -P -F "$F")
P2=$(tmux split-window -h -t "$P1" -c "$BASE/wt-ui" -P -F "$F")
P4=$(tmux split-window -h -t "$P3" -c "$REPO" -P -F "$F")
tmux select-pane -t "$P1" -T "API Agent"
tmux select-pane -t "$P2" -T "UI Agent"
tmux select-pane -t "$P3" -T "Test Agent"
tmux select-pane -t "$P4" -T "Monitor"
# 4. Dispatch literal tasks + Enter (C-m)
dispatch() {
  local t="npm test && agy -p '$2, no plan file' --mode plan"
  local m="printf 'FLEET_%s\n'"
  tmux send-keys -t "$1" -l -- "($t) && $m READY || $m FAIL"
  tmux send-keys -t "$1" C-m
}
sleep 0.5
dispatch "$P1" "Summarize src/api.js in 2 short lines"
dispatch "$P2" "Summarize src/ui.js in 2 short lines"
dispatch "$P3" "Summarize test/app.test.js in 2 short lines"
tmux select-pane -t "$P4" && echo "Fleet '$S' ready."
