# Lesson 4.1: Inside an Agent Skill — The Open `SKILL.md` Standard Explained

Welcome to Lesson 4.1 of **Advanced Vibe Coding**. This kit includes the complete zero-dependency `lab-skills` starter workspace (`package.json`, `CHANGELOG.md`, `src/release.js`, `test/release.test.js`) and the canonical `.agents/skills/release-audit/` skill bundle demonstrating 3-stage progressive loading, workspace-over-global precedence, and cross-agent portability.

## Learning Outcomes

1. Explain the canonical Agent Skill folder layout (`SKILL.md`, `scripts/`, `references/`, `examples/`) and why startup context pays only for the YAML frontmatter (~31 words) instead of the entire ~1,130-word bundle.
2. Predict and prove live discovery precedence: workspace `.agents/skills/` overrides `.agents/skills.json` and global `~/.gemini/config/skills/` whenever names collide.
3. Audit a skill bundle for open-standard cross-agent portability across Antigravity CLI, Claude Code, and Codex with zero hardcoded machine paths.

## 3-Stage Progressive Loading Cheat Sheet

| Stage | What Loads | Token Cost | Trigger |
| --- | --- | --- | --- |
| **Stage 1 · Catalog** | `name` + `description` YAML frontmatter only | `31` words in `release-audit` | Always injected at session start |
| **Stage 2 · Instructions** | Full `SKILL.md` procedure body | ~70 words | Only when the user invokes `/release-audit` or matches the description |
| **Stage 3 · Deep Assets** | `./references/`, `./examples/`, `./scripts/` | ~1,060+ words (0 until needed!) | Loaded or executed strictly on demand via relative links |

## Discovery Precedence Hierarchy

When two skills share the same `name`, the higher-priority tier wins:

| Priority | Location | Scope | Typical Use |
| --- | --- | --- | --- |
| **1 (Highest)** | `<repo>/.agents/skills/<name>/SKILL.md` | Project workspace (Git-tracked) | Team workflows & project-specific overrides |
| **2** | `<repo>/.agents/skills.json` | Declared workspace registries | Shared company/team skill repos without copying |
| **3** | `~/.gemini/config/skills/<name>/SKILL.md` | Machine-local global config | Personal default skills available in every folder |
| **4** | Built-in application skills | Harness defaults | Core bundled helpers |

## Cross-Agent Portability Map

Keep every skill plain UTF-8 text with relative `./scripts/`, `./references/`, and `./examples/` links and zero `/home/...` paths so the exact same folder works across harnesses:

| Harness | Project Skill Folder | Global Skill Folder |
| --- | --- | --- |
| **Antigravity CLI (`agy`)** | `.agents/skills/<name>/SKILL.md` | `~/.gemini/config/skills/<name>/SKILL.md` |
| **Codex CLI** | `.agents/skills/<name>/SKILL.md` | `~/.codex/skills/<name>/SKILL.md` |
| **Claude Code** | `.claude/skills/<name>/SKILL.md` | `~/.claude/skills/<name>/SKILL.md` |

## Included Files

- [`lab-skills/`](./lab-skills/) — Complete zero-dependency Node ESM starter repository (`package.json`, `CHANGELOG.md`, `src/release.js`, `test/release.test.js`) + full `.agents/skills/release-audit/` bundle (`SKILL.md`, `scripts/check-version.sh`, `references/release-policy.md`, `examples/sample-report.md`).

## Reproducible Hands-On Walkthrough

### 1. Copy the Starter Repo & Verify Tests + Progressive Footprint

```bash
cp -a lab-skills /workspace/lab-skills
cd /workspace/lab-skills
git init -b main && git add -A && git commit -m "init lab-skills with release-audit skill"
npm test
bash .agents/skills/release-audit/scripts/check-version.sh

# Compare 31-word startup frontmatter vs. full ~1,129-word bundle
awk '/^---$/{c++;next} c==1' .agents/skills/release-audit/SKILL.md | wc -w
wc -w .agents/skills/release-audit/SKILL.md \
  .agents/skills/release-audit/references/release-policy.md \
  .agents/skills/release-audit/examples/sample-report.md
```

### 2. Prove Global Fallback vs. Workspace Precedence Override Live

Create a colliding global fallback skill:

```bash
mkdir -p ~/.gemini/config/skills/release-audit
cat <<'EOF' > ~/.gemini/config/skills/release-audit/SKILL.md
---
name: release-audit
description: >-
  Global fallback release audit skill for Node packages. Use when the
  user asks to audit or verify release readiness.
---

# Global Release Audit

Always begin your audit output with the exact header:
`AUDIT_SOURCE: GLOBAL_DEFAULT`

## Procedure
1. Check `package.json` version and verify tests pass.
EOF
```

Now run the exact same `agy -p "<prompt>" --mode plan` command outside and inside `/workspace/lab-skills`:

```bash
# Outside workspace -> expects AUDIT_SOURCE: GLOBAL_DEFAULT
(cd /tmp && agy -p \
  "Run the release-audit skill right now. Output ONLY two lines: the exact AUDIT_SOURCE header required by the skill, and the path of the SKILL.md file you followed." \
  --mode plan)

# Inside workspace -> expects AUDIT_SOURCE: WORKSPACE_OVERRIDE
cd /workspace/lab-skills
agy -p \
  "Run the release-audit skill right now. Output ONLY two lines: the exact AUDIT_SOURCE header required by the skill, and the path of the SKILL.md file you followed." \
  --mode plan

# Clean up temporary global test skill
gio trash ~/.gemini/config/skills/release-audit
```

### 3. Run the Cross-Agent Portability Audit

```bash
awk '/^---$/{c++;next} c==1 && /^[a-z]+:/{print $1}' .agents/skills/release-audit/SKILL.md && \
file -b .agents/skills/release-audit/SKILL.md .agents/skills/release-audit/scripts/check-version.sh && \
(grep -rn '/home/' .agents/skills/ || echo "ZERO_HARDCODED_PATHS")
```
