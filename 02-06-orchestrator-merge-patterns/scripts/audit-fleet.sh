#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-main}"
STAT_ONLY=0
if [ "${1:-}" = "--stat-only" ]; then
  STAT_ONLY=1
  shift
fi

if [ "$#" -gt 0 ]; then
  BRANCHES=("$@")
else
  BRANCHES=(feat/api feat/ui feat/tests)
fi

echo "=== 1. Scope Audit: git diff --stat ${BASE}...<branch> ==="
for b in "${BRANCHES[@]}"; do
  echo "=== $b ==="
  git diff --stat "${BASE}...$b"
done

if [ "$STAT_ONLY" -eq 1 ]; then
  exit 0
fi

echo ""
echo "=== 2. Read-Only Architectural Diff Audit (agy --mode plan) ==="
(for b in "${BRANCHES[@]}"; do
  echo "=== $b ==="
  git diff "${BASE}...$b"
done) | xargs -0 -I{} agy -p \
  "Audit these ${#BRANCHES[@]} diffs (inline, no tools) for leaks, bugs, or conflict risks
in 5 short 1-line bullets (<=85 chars) ending with merge readiness: {}" \
  --mode plan
