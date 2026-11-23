#!/usr/bin/env bash
set -euo pipefail

diff_input=$(git diff --cached)
[ -z "$diff_input" ] && echo "PASS: no staged changes" && exit 0

prompt="Review this git diff for leaked secrets or missing tests.
Start your first line with PASS or FAIL, then a one-line reason."

raw=$(printf '%s\n' "$diff_input" | \
  agy -p "$prompt" --mode plan --output-format json)

verdict=$(printf '%s' "$raw" | jq -r '.response // .result // ""')
echo "$verdict"

[[ "$verdict" =~ ^[[:space:]]*PASS ]] && exit 0
echo "Commit blocked by diff-check.sh" >&2
exit 1
