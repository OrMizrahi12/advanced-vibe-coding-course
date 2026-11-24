#!/usr/bin/env bash
set -euo pipefail
ROOT=$(pwd); TMP=$(mktemp -d); OUT="${1:-/tmp/pr-eval-traces}"; PASS=0; TOT=0
trap 'python3 -c "import shutil,sys;shutil.rmtree(sys.argv[1],1)" "$TMP"' EXIT
mkdir -p "$OUT"; FMT="%-14s %-5s %-7s %-7s %-7s %s\n"
P="Follow .agents/skills/pr-readiness/SKILL.md. Do not edit files."
G=".agents/skills/pr-readiness/scripts/verify_env.sh"
T='(.usage//{})|(.total_tokens//((.input_tokens//0)+(.output_tokens//0)))'
V='(.response//.result//"")|[scan("VERDICT: (READY|BLOCKED)")]|last[0]//""'
printf "$FMT" CASE GATE EXPECT GOT TOKENS STATUS
for S in happy:PASS:READY failing-tests:FAIL:BLOCKED empty-diff:FAIL:BLOCKED;do
  IFS=: read -r N EG EV <<< "$S"; D="$TMP/$N"
  bash "$ROOT/evals/build-fixture.sh" "$ROOT" "$N" "$D"
  GS=$( cd "$D"; RC=0; GT=$(bash "$G" 2>&1) || RC=$?; DF=$(git diff main...HEAD)
    printf "Gate=%s\n%s\nDiff:\n%s\n" "$RC" "$GT" "${DF:-(empty)}" \
      | agy -p "$P" --mode plan --output-format json > "$OUT/$N.json"
    (( RC == 0 )) && echo PASS || echo FAIL )
  GOT=$(jq -r "$V" "$OUT/$N.json"); TK=$(jq -r "$T" "$OUT/$N.json")
  ST=FAIL; [[ "$GS:$GOT" == "$EG:$EV" ]] && ST=PASS && PASS=$((PASS + 1))
  TOT=$((TOT+TK)); printf "$FMT" "$N" "$GS" "$EV" "${GOT:-NONE}" "$TK" "$ST"
done; echo "EVAL_SCORE: $PASS/3 | TOTAL_TOKENS: $TOT"; (( PASS == 3 ))
