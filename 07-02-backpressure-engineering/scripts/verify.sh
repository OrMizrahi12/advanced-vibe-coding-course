#!/usr/bin/env bash
set -u; T0=$(date +%s%3N); LOG=$(mktemp); trap 'rm -f "$LOG"' EXIT
gate() {
  local idx="$1" name="$2" s0=$(date +%s%3N) ms; shift 2
  if "$@" >"$LOG" 2>&1; then
    ms=$(($(date +%s%3N) - s0))
    printf 'GATE_STAGE %s/4 %-9s ... PASS (%dms)\n' "$idx" "$name" "$ms"
  else
    local rc=$?; ms=$(($(date +%s%3N) - s0))
    printf 'GATE_STAGE %s/4 %-9s ... FAIL (%dms)\n' "$idx" "$name" "$ms"
    grep -Ev '^(✔|ℹ|[[:space:]]*$)' "$LOG" | head -n 10
    printf 'GATE_FAIL stage=%s exit=%d total=%dms\n' \
      "$name" "$rc" "$(($(date +%s%3N) - T0))"
    exit "$rc"
  fi
}
gate 1 typecheck ./node_modules/.bin/tsc --noEmit
gate 2 lint      node scripts/lint-check.mjs
gate 3 unit      node --test --test-reporter=spec test/*.test.js
gate 4 smoke     node scripts/smoke.mjs
printf 'VERIFY_PASS total=%dms\n' "$(($(date +%s%3N) - T0))"
