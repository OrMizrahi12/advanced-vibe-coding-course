#!/usr/bin/env bash
set -euo pipefail
PRD="PRD.json"
PROMPT_FILE="PROMPT.md"
LOG_DIR="/tmp/ralph"
ERR_LOG="$LOG_DIR/last-error.log"
AGY_BIN="${AGY_BIN:-agy}"
MAX_ITERS="${1:-10}"
mkdir -p "$LOG_DIR"

next_story_id() {
  jq -r '[.stories[] | select(.passes == false)][0].id // ""' "$PRD"
}
mark_story_pass() {
  local tmp; tmp=$(mktemp)
  jq --arg id "$1" '(.stories[] | select(.id == $id)).passes = true' \
    "$PRD" > "$tmp" && mv "$tmp" "$PRD"
}
stream_fmt() {
  jq -r --unbuffered '
    if .event=="init" then "  init: cid="+((.conversation_id//"new")[0:8])
    elif .event=="result" then (.result//.)|
      "  done: cid="+((.conversation_id//"?")[0:8])+
      " turns="+((.num_turns//0)|tostring)+" status="+(.status//"ok")
    else empty end'
}
for ((iter = 1; iter <= MAX_ITERS; iter++)); do
  sid=$(next_story_id)
  [ -z "$sid" ] && echo "RALPH_COMPLETE" && exit 0
  title=$(jq -r --arg id "$sid" '.stories[]|select(.id==$id)|.title' "$PRD")
  acc=$(jq -r --arg id "$sid" '.stories[]|select(.id==$id)|.acceptance' "$PRD")
  printf '=== [iter %d] %s: %s ===\n' "$iter" "$sid" "$title"
  task=$(cat "$PROMPT_FILE")
  task+=$'\n\n## Assigned Story\n'"- $sid: $title"$'\n'"- Acceptance: $acc"
  task+=$'\n\n## Recent Progress\n'"$(tail -n 6 PROGRESS.md)"
  [ -s "$ERR_LOG" ] && task+=$'\n\n## Prior Verify Failure\n'"$(cat "$ERR_LOG")"
  "$AGY_BIN" -p "$task" --mode accept-edits --output-format stream-json \
    | tee "$LOG_DIR/iter-${iter}.ndjson" | stream_fmt || true
  vout=""
  if [ -n "$(git status -s src/ test/)" ] && vout=$(npm run -s verify 2>&1); then
    rm -f "$ERR_LOG"
    mark_story_pass "$sid"
    printf -- '- %s (%s): verified and committed by ralph.sh.\n' \
      "$sid" "$title" >> PROGRESS.md
    git add -A && git commit -q -m "feat(ralph): $sid $title"
    printf '  verify: PASS (%s)\n' "$(printf '%s\n' "$vout" | tail -n 1)"
    printf '  commit: feat(ralph): %s %s\n' "$sid" "$title"
  else
    printf '%s\n' "${vout:-no edits detected in src/ or test/}" > "$ERR_LOG"
    printf '  verify: FAIL -> saved %s (no commit)\n' "$ERR_LOG"
  fi
done
[ -z "$(next_story_id)" ] && echo "RALPH_COMPLETE" && exit 0
printf 'RALPH_INCOMPLETE: max iterations (%d) reached\n' "$MAX_ITERS" >&2
exit 1
