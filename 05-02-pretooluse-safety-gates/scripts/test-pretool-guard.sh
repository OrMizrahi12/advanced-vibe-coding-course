#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GUARD="$SCRIPT_DIR/pretool-guard.py"

: > /tmp/guard-audit.jsonl

CASES=(
  '{"toolCall":{"name":"run_command","args":{"CommandLine":"rm -rf src"}}}|deny'
  '{"toolCall":{"name":"run_command","args":{"CommandLine":"git push --force origin main"}}}|deny'
  '{"toolCall":{"name":"view_file","args":{"AbsolutePath":"/workspace/lab-hooks/.env"}}}|deny'
  '{"toolCall":{"name":"run_command","args":{"CommandLine":"git status"}}}|allow:overwrite'
  '{"toolCall":{"name":"run_command","args":{"CommandLine":"npm test"}}}|allow'
)

PASS=0
for row in "${CASES[@]}"; do
  payload="${row%|*}"
  expect="${row##*|}"
  out=$(printf '%s\n' "$payload" | python3 "$GUARD")
  echo "$out"
  dec=$(python3 -c 'import json,sys; d=json.loads(sys.argv[1]); print(d["decision"] + (":overwrite" if "overwrite" in d else ""))' "$out")
  if [[ "$dec" != "$expect" ]]; then
    echo "FAIL: expected $expect, got $dec" >&2
    exit 1
  fi
  PASS=$((PASS + 1))
done

echo "PRETOOL_GUARD_TESTS: $PASS/${#CASES[@]} PASS"
