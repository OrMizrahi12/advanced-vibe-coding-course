#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOK="$SCRIPT_DIR/posttool-quality.py"
TMP="$(mktemp -d)"
trap 'python3 -c "import shutil,sys;shutil.rmtree(sys.argv[1],1)" "$TMP"' EXIT

mkdir -p "$TMP/src" "$TMP/node_modules/.bin"
cat <<'EOF' > "$TMP/README.md"
# Temp sandbox
EOF
printf '/** @returns {number} */\nexport function badDemo() {\n\tconsole.log("x");   \n\treturn "oops";\n}\n' > "$TMP/src/pricing.js"
cat <<'EOF' > "$TMP/node_modules/.bin/tsc"
#!/usr/bin/env bash
echo "src/pricing.js(4,3): error TS2322: Type 'string' is not assignable to type 'number'."
exit 2
EOF
chmod +x "$TMP/node_modules/.bin/tsc"

: > /tmp/quality-hook.jsonl
python3 -c 'from pathlib import Path; Path("/tmp/quality-pending.txt").unlink(missing_ok=True)'

# 1. Non-code .md file should be skipped cleanly with 0 JSONL rows
OUT1=$(printf '{"hookEventName":"PostToolUse","cwd":"%s","toolCall":{"name":"edit_file","args":{"Path":"README.md"}}}\n' "$TMP" | python3 "$HOOK")
[[ "$OUT1" == "{}" ]]
[[ "$(wc -l < /tmp/quality-hook.jsonl)" -eq 0 ]]

# 2. Dirty + debug + type-broken src/pricing.js formats in-place, logs ok=false, errs=2
OUT2=$(printf '{"hookEventName":"PostToolUse","cwd":"%s","toolCall":{"name":"edit_file","args":{"Path":"src/pricing.js"}}}\n' "$TMP" | python3 "$HOOK")
[[ "$OUT2" == "{}" ]]
ROW=$(cat /tmp/quality-hook.jsonl)
echo "POSTTOOL_ROW: $ROW"
python3 -c 'import json,sys; r=json.loads(sys.argv[1]); assert r["fmt"] is True and r["ok"] is False and r["errs"] == 2' "$ROW"

# 3. PostInvocation relays pending errors once via injectSteps + force_continue
OUT3=$(printf '{"hookEventName":"PostInvocation","cwd":"%s"}\n' "$TMP" | python3 "$HOOK")
echo "POSTINVOCATION: $OUT3"
python3 -c 'import json,sys; d=json.loads(sys.argv[1]); assert d["terminationBehavior"]=="force_continue"; m=d["injectSteps"][0]["systemMessage"]["systemMessage"]; assert "remove debug" in m and "TS2322" in m' "$OUT3"

# 4. Second PostInvocation after drain returns empty {}
OUT4=$(printf '{"hookEventName":"PostInvocation","cwd":"%s"}\n' "$TMP" | python3 "$HOOK")
[[ "$OUT4" == "{}" ]]

echo "POSTTOOL_QUALITY_TESTS: 4/4 PASS"
