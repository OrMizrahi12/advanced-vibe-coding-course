#!/usr/bin/env bash
set -euo pipefail
ROOT="$1"; NAME="$2"; DIR="$3"
cp -a "$ROOT" "$DIR"
cd "$DIR"
git config user.email "eval@superposition.local"
git config user.name "Superposition Eval"
[[ -n "$(git status --porcelain)" ]] && git add -A && git commit -qm snap
git checkout -q -b "eval/$NAME"
FIX="$ROOT/evals/fixtures/$NAME"
if [[ -f "$FIX/src/slug.js.tmpl" ]]; then
  cp "$FIX/src/slug.js.tmpl" src/slug.js
  cp "$FIX/test/slug.test.js.tmpl" test/slug.test.js
  git add src/slug.js test/slug.test.js && git commit -qm "eval: $NAME"
fi
