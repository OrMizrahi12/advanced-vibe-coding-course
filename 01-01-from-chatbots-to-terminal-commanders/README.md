# Lesson 1.1: From Chatbots to Terminal Commanders

Welcome to **Advanced Vibe Coding**. This starter kit gives you the exact open-standard `.agents/` layout, key terminology, and four-layer architecture map introduced in Lesson 1.1.

## Learning Outcomes

1. Diagnose why browser chatboxes create a manual copy-paste bottleneck on multi-file repositories.
2. Map the four-layer Advanced Vibe Coding stack from isolated terminal panes to zero-dollar cloud deploys.
3. Understand how isolated `git worktree` checkouts and open-standard `.agents/` files work together inside a Software Factory.

## Core Vocabulary

| Term | Definition |
| --- | --- |
| **Agent harness** | The runtime wrapper around a coding model that wires it directly into your filesystem, shell, compiler, test runner, git history, and deploy CLIs. |
| **Terminal-native agent** | A coding agent operating directly inside your terminal harness, reading real files on disk and repairing failures from live stack traces and test output. |
| **Software Factory** | A repeatable four-layer pipeline combining terminal isolation, open-standard context/guardrails, self-healing verification loops, and automated cloud delivery. |

## The Four-Layer Stack

| Layer | Name | Core Tools & Concepts | Course Sections |
| --- | --- | --- | --- |
| **Layer 1** | Multiplexer & Isolation | `tmux` multi-pane workspaces, `git worktree` isolated branches | Section 2 |
| **Layer 2** | Context & Control | `AGENTS.md`, Agent Skills (`SKILL.md`), lifecycle `hooks.json`, MCP, Playwright | Sections 3–6 |
| **Layer 3** | Loop Engineering | Headless CLI runs, outer Ralph Wiggum loops, verification backpressure, circuit breakers | Section 7 |
| **Layer 4** | $0 Production Stack | GitHub Actions, Supabase Postgres + Row Level Security, Vercel & Cloudflare | Sections 8–9 |

## Inside `starter-agents/`

Copy the `starter-agents/` folder into any repository as `.agents/` to establish portable, tool-agnostic project rules that work across Google Antigravity CLI (`agy`), Claude Code, and Codex CLI:

- `starter-agents/AGENTS.md` — Lean, high-signal engineering rules (kept short so context stays sharp).
- `starter-agents/hooks.json` — Deterministic `PreToolUse` safety guardrails and `PostToolUse` verification checks.
- `starter-agents/mcp_config.json` — Standard remote tool endpoint configuration (Model Context Protocol).
- `starter-agents/skills/factory-spec/SKILL.md` — Reusable workflow instructions with YAML frontmatter for partitioning a feature spec into isolated verified worktree branches.

## Quick Verification Commands

```bash
# Inspect your open-standard agent configuration
ls -la .agents .agents/skills/factory-spec/

# Inspect isolated parallel worktrees backed by one shared git history
git worktree list

# Inspect atomic branch history cleanly above main
git log --oneline --graph --all --decorate -n 8
```
