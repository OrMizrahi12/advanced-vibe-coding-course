# Lesson 4.3: Advanced Skills — Executable `scripts/`, Validation Gates & `skills.json`

Welcome to Lesson 4.3 of **Advanced Vibe Coding**. This kit includes the upgraded split-responsibility `pr-readiness` skill (`SKILL.md` + executable `scripts/verify_env.sh` + `references/checklist.md`), the shared skill library (`shared-skills/`) with workspace `.agents/skills.json` inheritance and `exclude` filtering, and the flawed/clean `env-config` practice branch files.

## Learning Outcomes

1. Split skill responsibilities cleanly: deterministic shell checks (`scripts/verify_env.sh`) handle binary pass/fail facts with hard exit codes (`0` / `1`), while the model applies engineering judgment via `references/checklist.md`.
2. Enforce a hard gate rule so `VERDICT: READY` is impossible whenever `verify_env.sh` exits non-zero.
3. Share skills across repositories with zero copy-paste drift using `.agents/skills.json` (`entries`, `inherits`, `exclude`, `include_only`).

## Split-Responsibility Skill Blueprint

| Layer | File | Responsibility | Runs / Loads When |
| --- | --- | --- | --- |
| **Router + Gate Rule** | `SKILL.md` (20 lines, 33 frontmatter words) | Declares trigger + mandates running `verify_env.sh` FIRST | Frontmatter at startup; body on activation |
| **Deterministic Gate** | `scripts/verify_env.sh` (21 lines, `chmod +x`) | Checks Node `>= 20`, clean `git status`, `.env`/secret literals, `npm test` → exits `0` or `1` | Executed first; stdout + exit code become facts |
| **Judgment Rubric** | `references/checklist.md` (16 lines) | Evaluates breaking API changes & negative edge-case tests | Opened on demand during review |

### `verify_env.sh` Exit-Code Contract

- Prints four structured rows (`PASS` or `FAIL`) for `NODE`, `GIT_CLEAN`, `SECRETS`, and `TESTS`.
- Prints `GATE_RESULT: PASS` and exits **`0`** only when all four checks succeed.
- Prints `GATE_RESULT: FAIL` and exits **`1`** on any single failure (forcing `VERDICT: BLOCKED`).

## `.agents/skills.json` Schema Reference

| Field | Scope | Required | Description |
| --- | --- | --- | --- |
| `entries` | Top-level array | Optional | Local or shared skill directories scanned one level deep |
| `inherits` | Top-level array | Optional | Other `skills.json` files merged in order before local entries |
| `path` | Entry / inherit item | Yes | Absolute (`/workspace/...`), home-relative (`~/...`), or repo-relative path |
| `include_only` | Entry / inherit item | Optional | Allowlist of skill directory names/patterns to load exclusively |
| `exclude` | Entry / inherit item | Optional | Denylist of skill directory names/patterns to skip (e.g., `["legacy-lint"]`) |

## Included Files

- [`pr-readiness/`](./pr-readiness/) — Upgraded 20-line `SKILL.md`, executable 21-line `scripts/verify_env.sh`, and 16-line `references/checklist.md`.
- [`shared-skills/`](./shared-skills/) — External shared library (`skills.json`, `commit-style/SKILL.md`, `legacy-lint/SKILL.md`).
- [`skills.json`](./skills.json) — Exact 11-line workspace `.agents/skills.json` inheriting `shared-skills` while excluding `legacy-lint`.
- [`practice-branch/`](./practice-branch/) — Flawed (hardcoded synthetic placeholder) and clean versions of `src/env-config.js` and `test/env-config.test.js`.

## Reproducible Hands-On Walkthrough

> **Prerequisite:** Start from `/workspace/lab-skills` cleanly committed on `main` (from Lesson 4.2, `pass 5, fail 0`).

```bash
# 1. Upgrade pr-readiness with executable verify_env.sh & checklist.md
cp -r pr-readiness/* /workspace/lab-skills/.agents/skills/pr-readiness/
chmod +x /workspace/lab-skills/.agents/skills/pr-readiness/scripts/verify_env.sh
cd /workspace/lab-skills
git add .agents/skills/pr-readiness && git commit -m "feat(skills): add verify_env gate to pr-readiness"
bash .agents/skills/pr-readiness/scripts/verify_env.sh; echo "EXIT=$?"   # expects GATE_RESULT: PASS, EXIT=0

# 2. Reproduce GATE_RESULT: FAIL -> VERDICT: BLOCKED
git checkout -b feat/env-config
cp <kit>/practice-branch/flawed/src/env-config.js src/env-config.js
cp <kit>/practice-branch/flawed/test/env-config.test.js test/env-config.test.js
git add src/env-config.js test/env-config.test.js && git commit -m "feat(config): draft env-config"
echo "SERVICE_API_KEY=local-scratch" > .env
npm test                                               # 7/7 tests still pass!
agy -p "/pr-readiness" --mode accept-edits             # verify_env.sh exits 1 -> VERDICT: BLOCKED

# 3. Fix cleanly and reproduce GATE_RESULT: PASS -> VERDICT: READY
gio trash .env
cp <kit>/practice-branch/clean/src/env-config.js src/env-config.js
cp <kit>/practice-branch/clean/test/env-config.test.js test/env-config.test.js
git add src/env-config.js test/env-config.test.js && git commit -m "fix(config): require env key without fallback literal"
agy -p "/pr-readiness" --mode accept-edits             # verify_env.sh exits 0 -> VERDICT: READY

# 4. Merge to main and wire shared-skills via .agents/skills.json
git checkout main && git merge --no-ff feat/env-config -m "feat(config): merge verified env-config helper" && git branch -d feat/env-config
cp -r <kit>/shared-skills /workspace/shared-skills
cp <kit>/skills.json /workspace/lab-skills/.agents/skills.json
agy -p "List every skill in your active skill catalog by name, confirm whether legacy-lint is excluded, and use commit-style to draft one commit message for adding .agents/skills.json." \
  --add-dir /workspace/shared-skills --mode plan
git add .agents/skills.json && git commit -m "chore(skills): inherit shared commit-style via skills.json"
```
