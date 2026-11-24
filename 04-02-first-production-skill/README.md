# Lesson 4.2: Building Your First Production Skill & Custom Slash Command

Welcome to Lesson 4.2 of **Advanced Vibe Coding**. This kit includes the verified 21-line `.agents/skills/pr-readiness/SKILL.md` production skill (33 frontmatter words), the exact practice-branch files to reproduce both `VERDICT: BLOCKED` and `VERDICT: READY` on `feat/changelog-formatter`, and the Trigger Engineering + Negative-Control Testing cheat sheet.

## Learning Outcomes

1. Write crisp third-person YAML `description:` frontmatter stating both **what** a skill does and **when** to trigger it so semantic routing activates automatically without misfiring on routine questions.
2. Invoke any workspace skill explicitly via automatic `/<skill-name>` slash-command autocomplete (e.g., `/pr-readiness`) and refresh edits mid-session with `/skills reload`.
3. Pair positive automatic-activation tests with a headless negative-control check (`agy -p "<prompt>" --mode plan`) to prove zero false activations.

## Third-Person Trigger Engineering Cheat Sheet

| Quality | Vague / Flaky `description:` (Avoid) | Crisp Production `description:` (Use) |
| --- | --- | --- |
| **Voice** | `"Helps me check git stuff"` (first-person, ambiguous) | `"Reviews staged and branch git diffs for test coverage, secrets, and breaking changes."` (third-person, concrete) |
| **Activation cue** | Missing trigger context (fires on any `git` question!) | `"Use before opening a pull request or when asked if a branch is ready to merge."` |
| **Guardrail** | Unspecified behavior on failure | `"Never invent pass results, skip failing tests, or edit files unless asked."` |

### Custom Slash Command & Reload Reference

| Command | Behavior |
| --- | --- |
| `/pr` → autocomplete | Surfaces `/pr-readiness` automatically from `.agents/skills/pr-readiness/SKILL.md` |
| `/pr-readiness` | Forces explicit skill activation immediately |
| `/skills reload` | Reloads edited `SKILL.md` frontmatter and instructions inside a running `agy` session |

### Negative-Control Testing Checklist

Before trusting any production skill across a team:
1. **Explicit Slash Trigger:** Run `/<skill-name>` on a flawed branch → confirm deterministic `VERDICT: BLOCKED` citing exact line numbers.
2. **Cold Automatic Trigger:** Open a brand-new `agy` session and ask a natural user question (without naming the skill) → confirm semantic routing activates automatically and returns `VERDICT: READY`.
3. **Negative Control:** Run an adjacent non-triggering question via `agy -p "..." --mode plan` (e.g., `"What is the current git branch name?"`) → confirm a clean one-line answer with zero skill misfire.

## Included Files

- [`.agents/skills/pr-readiness/SKILL.md`](./.agents/skills/pr-readiness/SKILL.md) — Exact 21-line production skill (`33` frontmatter words).
- [`practice-branch/commit-2-blocked/src/changelog-note.js`](./practice-branch/commit-2-blocked/src/changelog-note.js) — Commit 2 variant with planted line 3 `TODO` and line 8 `console.log` (tests still pass `5/5`, triggering `VERDICT: BLOCKED`).
- [`practice-branch/commit-3-ready/src/changelog-note.js`](./practice-branch/commit-3-ready/src/changelog-note.js) — Clean Commit 3 fix with tag validation and zero debug logs (`VERDICT: READY`).
- [`practice-branch/test/changelog-note.test.js`](./practice-branch/test/changelog-note.test.js) — 2 unit tests verifying formatting and breaking-change detection.

## Reproducible Hands-On Walkthrough

> **Prerequisite:** Start from `/workspace/lab-skills` cleanly committed on `main` (from Lesson 4.1, `pass 3, fail 0`).

```bash
# 1. Install and commit pr-readiness on main
mkdir -p /workspace/lab-skills/.agents/skills/pr-readiness
cp .agents/skills/pr-readiness/SKILL.md /workspace/lab-skills/.agents/skills/pr-readiness/SKILL.md
cd /workspace/lab-skills
awk '/^---$/{c++;next} c==1' .agents/skills/pr-readiness/SKILL.md | wc -w   # expects: 33
git add .agents/skills/pr-readiness/SKILL.md && git commit -m "Add pr-readiness production skill"

# 2. Create feature branch with subtle pre-PR hygiene slips (tests pass 5/5!)
git checkout -b feat/changelog-formatter
cp <kit>/practice-branch/commit-2-blocked/src/changelog-note.js src/changelog-note.js
cp <kit>/practice-branch/test/changelog-note.test.js test/changelog-note.test.js
npm test && git add src/changelog-note.js test/changelog-note.test.js && \
  git commit -m "Add changelog formatter with pre-PR hygiene slips"

# 3. Test explicit /pr-readiness inside agy -> expects VERDICT: BLOCKED
agy

# 4. Apply clean fix and commit
cp <kit>/practice-branch/commit-3-ready/src/changelog-note.js src/changelog-note.js
npm test && git add src/changelog-note.js && \
  git commit -m "Remove debug log and validate tag in changelog formatter"

# 5. Open a brand-new agy session and ask naturally: "Is this branch ready to open a PR?"
#    -> expects automatic activation and VERDICT: READY
agy

# 6. Run negative-control check -> expects one crisp branch name, ZERO skill misfire
agy -p "What is the current git branch name? Reply in one short line." --mode plan

# 7. Merge cleanly onto main
git checkout main && git merge --no-ff feat/changelog-formatter -m "Merge verified changelog note formatter" && \
  git branch -d feat/changelog-formatter
```
