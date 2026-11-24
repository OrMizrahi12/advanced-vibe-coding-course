#!/usr/bin/env bash
set -euo pipefail
VER=$(node -p "JSON.parse(require('fs').readFileSync('package.json','utf8')).version")
grep -q "## \[$VER\]" CHANGELOG.md || { echo "MISSING_CHANGELOG: $VER"; exit 1; }
echo "VERSION_OK: v$VER (matched in CHANGELOG.md)"
