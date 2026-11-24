# Lesson 4.5: Evaluating & Hardening Skills — Turning Flaky Prompts Into Reliable Tools

Welcome to Lesson 4.5 of **Advanced Vibe Coding**. This kit includes the headless 3-case skill eval runner (`scripts/eval-pr-skill.sh`), the sandboxed Git fixture builder (`evals/build-fixture.sh` + `.tmpl` templates), the hardened `pr-readiness` skill bundle (`SKILL.md`, 5-check `verify_env.sh`, `checklist.md`), and `jq` JSON trace telemetry recipes.

## Learning Outcomes

1. Build repeatable headless skill evaluations using `agy -p "$P" --mode plan --output-format json` across isolated temporary Git checkouts (`happy`, `failing-tests`, `empty-diff`).
2. Audit failure traces and per-case token burn with `jq` to spot silent edge cases (`empty-diff` returning exit `0`!) without guessing.
3. Harden both the deterministic gate (`verify_env.sh`) and output contract (`SKILL.md`) while keeping startup frontmatter flat at **33 words** (139 total words), proving deterministic `3/3 PASS` across repeated runs.

## The Skill Hardening Loop

1. **Author Fixtures (`.tmpl`):** Store fixture source & test files with a `.tmpl` suffix so `node --test` on `main` never executes eval fixtures accidentally.
2. **Run Headless Evals:** Execute `./scripts/eval-pr-skill.sh` — clones into `mktemp -d`, applies each fixture branch, captures `verify_env.sh` + `agy -p "$P" --mode plan --output-format json`, scores `GATE` + `VERDICT`, and sums `TOTAL_TOKENS`.
3. **Inspect JSON Traces (`jq`):** Audit `.status`, `.usage`, and `.response` tail on failing cases.
4. **Harden & Re-Verify:** Close deterministic holes in `scripts/` first, tighten the final-line contract in `SKILL.md` without bloating frontmatter, and prove `EVAL_SCORE: 3/3` twice in a row.

## `jq` Telemetry Recipes

```bash
# Inspect status, token usage, and response tail for a single eval trace
jq '{status, usage, tail: ((.response // .result // "")[-140:])}' \
  /tmp/pr-eval-traces/empty-diff.json

# Summarize per-case total tokens alongside SKILL.md word footprint
for f in /tmp/pr-eval-traces/*.json; do
  printf "%-14s tokens=%s\n" "$(basename "$f" .json)" \
    "$(jq -r '(.usage//{})|(.total_tokens//((.input_tokens//0)+(.output_tokens//0)))' "$f")"
done && echo "--- SKILL.md words ---" && \
printf "frontmatter=%s total=%s\n" \
  "$(awk '/^---$/{c++;next} c==1' .agents/skills/pr-readiness/SKILL.md | wc -w)" \
  "$(wc -w < .agents/skills/pr-readiness/SKILL.md)"
```

## Exact Lesson 4.3 → 4.5 Hardening Diff (`SKILL.md`)

```diff
@@ -10,11 +10,11 @@
 Run the deterministic validation gate FIRST before any prose review:
 
 1. **Validation Gate:** Execute [verify_env.sh](./scripts/verify_env.sh)
-   with `bash .agents/skills/pr-readiness/scripts/verify_env.sh` and
-   capture its exact status lines and exit code (`0` or `1`).
+   (or use the supplied gate output) and record all 5 checks + exit code.
 2. **Judgment Rubric:** Open [checklist.md](./references/checklist.md)
-   and review `git diff main...HEAD` for breaking exports and edge-case
-   test coverage.
-3. **Hard Gate Rule:** NEVER report `VERDICT: READY` if `verify_env.sh`
-   exits non-zero. Output a 4-row table plus `VERDICT: READY` or
-   `VERDICT: BLOCKED`. Never edit files unless asked.
+   and inspect `git diff main...HEAD`. If the diff is empty or missing
+   target changes, STOP and treat the branch as blocked.
+3. **Hard Verdict Contract:** NEVER output `VERDICT: READY` if the gate
+   exits non-zero OR if the diff is empty. Output a 5-row table, then
+   end the final line with EXACTLY `VERDICT: READY` or `VERDICT: BLOCKED`
+   with no markdown bolding or trailing prose. Never edit files.
```

## Included Files

- [`scripts/eval-pr-skill.sh`](./scripts/eval-pr-skill.sh) — Exact 21-line headless 3-case eval runner (`chmod +x`).
- [`evals/build-fixture.sh`](./evals/build-fixture.sh) + [`evals/fixtures/`](./evals/fixtures/) — Exact 15-line sandbox fixture builder (`chmod +x`) and `happy`, `failing-tests`, and `empty-diff` templates.
- [`pr-readiness/`](./pr-readiness/) — Hardened 20-line `SKILL.md` (33 frontmatter words, 139 total), hardened 21-line 5-check `scripts/verify_env.sh` (adds `DIFF` empty-diff gate), and 16-line `references/checklist.md`.

## Reproducible Hands-On Walkthrough

> **Prerequisite:** Start from `/workspace/lab-skills` cleanly committed on `main` (from Lesson 4.4, `pass 9, fail 0`).

```bash
# 1. Install eval harness and fixtures into /workspace/lab-skills
cp -r evals /workspace/lab-skills/evals
cp scripts/eval-pr-skill.sh /workspace/lab-skills/scripts/eval-pr-skill.sh
chmod +x /workspace/lab-skills/evals/build-fixture.sh /workspace/lab-skills/scripts/eval-pr-skill.sh

cd /workspace/lab-skills

# 2. Run against Lesson 4.3 unhardened skill -> catches empty-diff (EVAL_SCORE: 2/3, EXIT=1)
./scripts/eval-pr-skill.sh /tmp/pr-eval-traces; echo "EXIT=$?"

# 3. Install hardened pr-readiness bundle and confirm flat startup footprint (33 / 139 words)
cp -r <kit>/pr-readiness/* .agents/skills/pr-readiness/
chmod +x .agents/skills/pr-readiness/scripts/verify_env.sh
awk '/^---$/{c++;next} c==1' .agents/skills/pr-readiness/SKILL.md | wc -w
wc -w < .agents/skills/pr-readiness/SKILL.md

# 4. Prove deterministic 3/3 PASS across repeated runs
./scripts/eval-pr-skill.sh /tmp/pr-eval-run2; echo "EXIT=$?"
./scripts/eval-pr-skill.sh /tmp/pr-eval-run3; echo "EXIT=$?"

# 5. Commit cleanly on main
git add .agents/skills/pr-readiness evals scripts/eval-pr-skill.sh && \
  git commit -m "feat(skills): harden pr-readiness and add headless eval suite" && \
  npm test
```
