#!/usr/bin/env bash
set -euo pipefail
FAIL=0
NV=$(node -v); MAJ=${NV#v}; MAJ=${MAJ%%.*}
if (( MAJ >= 20 )); then echo "PASS | NODE      | $NV"
else echo "FAIL | NODE      | $NV (need >=20)"; FAIL=1; fi
STAT=$(git status --porcelain)
if [[ -z "$STAT" ]]; then echo "PASS | GIT_CLEAN | working tree clean"
else echo "FAIL | GIT_CLEAN | dirty working tree"; FAIL=1; fi
DIFF=$(git diff main...HEAD -- . ":(exclude).agents"; \
  git diff --cached -- . ":(exclude).agents")
ENVF=$(printf "%s\n%s\n" "$STAT" "$(git diff --name-only main...HEAD)" \
  | grep -E "(^|[ /])\.env" || true)
PAT='^\+.*(API_KEY|SECRET_KEY) *= *[^[:space:]]'
if [[ -n "$ENVF" ]] || grep -qE "$PAT" <<< "$DIFF"; then
  echo "FAIL | SECRETS   | .env or secret literal found"; FAIL=1
else echo "PASS | SECRETS   | zero .env or key literals"; fi
if npm test >/dev/null 2>&1; then echo "PASS | TESTS     | npm test green"
else echo "FAIL | TESTS     | npm test failed"; FAIL=1; fi
if (( FAIL == 0 )); then echo "GATE_RESULT: PASS"; exit 0
else echo "GATE_RESULT: FAIL"; exit 1; fi
