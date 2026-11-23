#!/usr/bin/env bash
set -euo pipefail
S="${1:-fleet}"
tmux has-session -t "$S" 2>/dev/null || { echo "No session '$S'"; exit 1; }
echo "=== FLEET STATUS ($S) ==="
ready=0; failed=0; total=0
FMT='#{pane_id}|#{pane_index}|#{pane_title}'
while IFS='|' read -r pid idx title; do
  [ "$title" = "Monitor" ] && continue
  total=$((total + 1))
  out="$(tmux capture-pane -p -t "$pid" -S -30)"
  if printf '%s\n' "$out" | grep -qx "FLEET_READY"; then
    state="READY"; ready=$((ready + 1))
  elif printf '%s\n' "$out" | grep -qx "FLEET_FAIL"; then
    state="FAILED"; failed=$((failed + 1))
  else
    state="RUNNING"
  fi
  pass="$(printf '%s\n' "$out" | grep -oE 'pass [0-9]+' | tail -n 1 || true)"
  printf "[%s] %-10s | %-7s | %s\n" "$idx" "$title" "$state" "${pass:-...}"
done < <(tmux list-panes -t "$S" -F "$FMT")
echo "Summary: $ready/$total ready, $failed failed"
