#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CTX_HOOK="$SCRIPT_DIR/session-context.py"
STOP_HOOK="$SCRIPT_DIR/stop-test-gate.py"
TMP="$(mktemp -d)"
trap 'python3 -c "import shutil,sys;shutil.rmtree(sys.argv[1],1)" "$TMP"' EXIT

# Build tiny isolated git repo with a dirty TODO.md and a failing npm test
git -C "$TMP" init -q -b main
git -C "$TMP" config user.email "test@superposition.local"
git -C "$TMP" config user.name "Superposition Test"
cat <<'EOF' > "$TMP/package.json"
{"name":"tmp-steer","private":true,"scripts":{"test":"node -e \"console.error('15 !== 16'); process.exit(1)\""}}
EOF
git -C "$TMP" add package.json && git -C "$TMP" commit -qm "init"
cat <<'EOF' > "$TMP/TODO.md"
# Lab Hooks Tasks
- [x] Wire PreToolUse safety gate
- [ ] Add calcTax(cents, ratePct) with rounding + unit test
EOF

# 1. Verify SessionStart injectSteps nested systemMessage contract
: > /tmp/session-context.jsonl
OUT_CTX=$(printf '{"hookEventName":"SessionStart","cwd":"%s"}\n' "$TMP" | python3 "$CTX_HOOK")
echo "SESSION_START: $OUT_CTX"
python3 -c 'import json,sys; d=json.loads(sys.argv[1]); m=d["injectSteps"][0]["systemMessage"]["systemMessage"]; assert "branch=main" in m and "?? TODO.md" in m and "Add calcTax" in m' "$OUT_CTX"

# 2. Verify all 4 Stop safety paths: skip -> retry 1 -> retry 2 -> cap_reached
: > /tmp/stop-gate.jsonl
: > /tmp/stop-retries.json
for p in \
  "{\"conversationId\":\"dry\",\"cwd\":\"$TMP\",\"terminationReason\":\"USER_CANCELED\",\"continuationActive\":false}" \
  "{\"conversationId\":\"dry\",\"cwd\":\"$TMP\",\"terminationReason\":\"NO_TOOL_CALL\",\"continuationActive\":false}" \
  "{\"conversationId\":\"dry\",\"cwd\":\"$TMP\",\"terminationReason\":\"NO_TOOL_CALL\",\"continuationActive\":true}" \
  "{\"conversationId\":\"dry\",\"cwd\":\"$TMP\",\"terminationReason\":\"NO_TOOL_CALL\",\"continuationActive\":true}"; do
  printf '%s\n' "$p" | python3 "$STOP_HOOK" > /dev/null
done

cat /tmp/stop-gate.jsonl
python3 - <<'PY'
import json
rows = [json.loads(line) for line in open("/tmp/stop-gate.jsonl", encoding="utf-8")]
expected = [
    ("skip", 0, False, "allow"),
    ("fail", 1, False, "continue"),
    ("fail", 2, True, "continue"),
    ("cap_reached", 0, True, "allow"),
]
actual = [(r["status"], r["retry"], r["cont"], r["decision"]) for r in rows]
assert actual == expected, f"Mismatch: {actual} != {expected}"
PY

echo "LOOP_STEERING_TESTS: 5/5 PASS"
