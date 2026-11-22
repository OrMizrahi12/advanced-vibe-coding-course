# Lesson 1.2: Picking Your Terminal Agent — Antigravity CLI vs. Claude Code, Codex & Legacy Gemini CLI

This student kit contains the exact portable `.agents/` workspace, cross-CLI translation map, and late-2026 cost comparison inspected on screen in Lesson 1.2 of **Advanced Vibe Coding**.

## Learning Outcomes

1. Trace how Google's native Go-based **Antigravity CLI (`agy`)** superseded the legacy TypeScript Gemini CLI under one unified execution harness.
2. Verify non-interactive headless automation flags (`-p`, `--output-format`, `--json-schema`) and `settings.json` permission allow/deny rules.
3. Map one open-standard `.agents/` + `AGENTS.md` workspace across **Antigravity CLI (`agy`)**, **Claude Code (`claude`)**, and **Codex CLI (`codex`)**.
4. Choose a practical late-2026 cost & entry path starting at `$0/month` with zero vendor lock-in.

## Core Vocabulary

| Term | Definition |
| --- | --- |
| **Execution harness** | The runtime layer wiring a coding model to your filesystem, shell, lifecycle hooks, and tool permissions across CLI, desktop app, and IDE. |
| **Open standards** | Plain-text repository conventions (`AGENTS.md`, `SKILL.md` with YAML frontmatter, JSON hooks, MCP configs) readable across multiple terminal agents. |
| **Agent-agnostic workflow** | An engineering workflow anchored in versioned repo files, `tmux`, and `git worktree` so switching terminal binaries takes minutes instead of a rebuild. |

## Inside `portable-demo/`

Copy the files inside `portable-demo/` into any project repository to establish a clean, portable agent configuration:

- `portable-demo/AGENTS.md` — Concise, 9-line project engineering rules loaded cleanly without wasting context.
- `portable-demo/.agents/skills/review-pr/SKILL.md` — Open-standard Agent Skill with YAML frontmatter (`name`, `description`) and a 4-step pull request readiness checklist.
- `portable-demo/.agents/hooks.json` — Deterministic `PreToolUse` safety guardrail and `PostToolUse` silent typecheck hook.
- `portable-demo/.agents/mcp_config.json` — Pairs a remote Streamable HTTP MCP endpoint (`https://mcp.supabase.com/mcp`) with a local filesystem Stdio MCP server.
- `portable-demo/agent-map.md` — Side-by-side late-2026 portability table across `agy`, `claude`, and `codex`.
- `portable-demo/budget-paths.md` — Late-2026 monthly entry, builder, and fleet tier ladder across all three CLIs.

## Quick Verification Commands

```bash
# Inspect the complete portable directory layout
cd portable-demo
find . -maxdepth 4 | sort

# Inspect project rules, skill, hooks, and MCP config
cat AGENTS.md
cat .agents/skills/review-pr/SKILL.md
cat .agents/hooks.json
cat .agents/mcp_config.json

# Review the cross-CLI portability map and cost paths
cat agent-map.md
cat budget-paths.md
```

## Official Primary References (Verified November 2026)

- Antigravity CLI Features: https://antigravity.google/docs/cli/features
- Antigravity CLI Reference (Slash Commands & Flags): https://antigravity.google/docs/cli/reference
- Antigravity Pricing (`$0/month` For Individuals vs. Google AI Pro / Ultra): https://antigravity.google/pricing
