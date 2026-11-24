# Lesson 4.4: Multi-Step Workflows — From Prompt Chains to Dynamic Orchestration

Welcome to Lesson 4.4 of **Advanced Vibe Coding**. This kit includes the verified 21-line stage-gated `.agents/skills/feature-flow/SKILL.md` skill (31 frontmatter words), the 21-line Antigravity Python dynamic workflow (`scripts/audit-workflow.py`), the verified `formatReleaseDate` reference output (`reference-feature/`), and the Chained Skill vs. Dynamic Workflow decision matrix.

## Learning Outcomes

1. Structure single-feature builds as a 4-stage gated skill (`SPEC` → `PLAN GATE` → `BUILD` → `VERIFY GATE`) that mechanically pauses before editing disk unless `AUTO_APPROVE` is granted.
2. Choose cleanly between a chained `SKILL.md` procedure and a Python dynamic workflow (`/run-workflow` with `phase`, `agent`, `parallel`, `pipeline`, and JSON `schema`).
3. Validate dynamic workflow scripts containing top-level `await` using Python's `ast.PyCF_ALLOW_TOP_LEVEL_AWAIT` flag and migrate legacy `.agents/workflows/*.md` files with `/migrate-workflows`.

## Decision Matrix: Chained `SKILL.md` vs. Python Dynamic Workflow (`/run-workflow`)

| Dimension | Stage-Gated `SKILL.md` (`feature-flow`) | Python Dynamic Workflow (`scripts/audit-workflow.py`) |
| --- | --- | --- |
| **Best For** | Linear single-feature build with human checkpoints | Fanning out across N files/modules with schema-validated aggregation |
| **Orchestration Layer** | Natural-language stage gates inside one thread | Real Python control flow (`phase`, `agent`, `parallel`, `pipeline`, `log`) |
| **Context Isolation** | Shared thread (compact single-file scope) | Each `agent(...)` child runs in its own isolated context window |
| **Output Contract** | 4-row Markdown table + `FLOW_STATUS: VERIFIED` | Strict JSON `schema` enforced per child + aggregated `log(...)` lines |
| **Human Approval** | Mechanical `PLAN GATE` pause (bypassed via `AUTO_APPROVE`) | Orchestrated batch execution via `/run-workflow` |

### Legacy Workflows Migration Reference

- Legacy `.agents/workflows/*.md` files are superseded by `.agents/skills/<name>/SKILL.md` (for prompt-driven stage workflows) and Python dynamic workflow scripts (for code-driven fan-out via `/run-workflow`).
- Run `/migrate-workflows` inside `agy` to convert legacy `.agents/workflows/*.md` files into `.agents/skills/<name>/SKILL.md` and archive originals cleanly as `.md.bak`.

### `AUTO_APPROVE` Batch-Mode Usage

- **Interactive (default):** Omit `AUTO_APPROVE` so `feature-flow` halts at Stage 2 (`PLAN GATE`), displays exact target files, and waits for `"Approved, proceed to Build and Verify."`.
- **Headless / batch mode:** Include `AUTO_APPROVE` explicitly in scoped automated runs:
  ```bash
  agy -p "/feature-flow AUTO_APPROVE Add formatReleaseDate(isoDate) in src/release-date.js and 2 tests in test/release-date.test.js." --mode accept-edits
  ```

## Included Files

- [`.agents/skills/feature-flow/SKILL.md`](./.agents/skills/feature-flow/SKILL.md) — Exact 21-line 4-stage gated skill (`31` frontmatter words).
- [`scripts/audit-workflow.py`](./scripts/audit-workflow.py) — Exact 21-line Antigravity `/run-workflow` script discovering `src/*.js` and running parallel `flash` audits against a strict JSON schema.
- [`reference-feature/`](./reference-feature/) — Verified `src/release-date.js`, `test/release-date.test.js`, and `package.json` (`npm test` green).

## Reproducible Hands-On Walkthrough

> **Prerequisite:** Start from `/workspace/lab-skills` cleanly committed on `main` (from Lesson 4.3, `pass 7, fail 0`).

```bash
# 1. Verify reference feature standalone
(cd reference-feature && npm test && node --check src/release-date.js)

# 2. Install feature-flow & audit-workflow.py into /workspace/lab-skills
mkdir -p /workspace/lab-skills/.agents/skills/feature-flow /workspace/lab-skills/scripts
cp .agents/skills/feature-flow/SKILL.md /workspace/lab-skills/.agents/skills/feature-flow/SKILL.md
cp scripts/audit-workflow.py /workspace/lab-skills/scripts/audit-workflow.py

cd /workspace/lab-skills
awk '/^---$/{c++;next} c==1' .agents/skills/feature-flow/SKILL.md | wc -w   # expects: 31

# 3. Validate top-level await Python workflow syntax cleanly
python3 -c "import ast; compile(open('scripts/audit-workflow.py').read(), 'scripts/audit-workflow.py', 'exec', flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT); print('WORKFLOW_SYNTAX_OK')"

# 4. Commit skill and run interactive /feature-flow in agy
git add .agents/skills/feature-flow/SKILL.md && git commit -m "feat(skills): add 4-stage feature-flow skill"
agy
```

Inside `agy`:
1. Type `/fe` to see `/feature-flow` autocomplete, then run:
   `/feature-flow Add formatReleaseDate(isoDate) in src/release-date.js converting YYYY-MM-DD into "Mon DD, YYYY" UTC and rejecting invalid dates, plus 2 node:test cases in test/release-date.test.js.`
2. Confirm Stage 2 (`PLAN GATE`) pauses with zero files touched, then reply: `Approved, proceed to Build and Verify.`
3. Confirm Stage 4 (`VERIFY GATE`) passes `npm test` (`pass 9, fail 0`) and prints `FLOW_STATUS: VERIFIED`, then `/exit` and commit `src/release-date.js` & `test/release-date.test.js`.
4. Open a fresh `agy` session and run:
   `/run-workflow Execute scripts/audit-workflow.py using run_workflow (ScriptPath) against this workspace and print the aggregated log lines.`
