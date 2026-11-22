# Agent-Agnostic CLI Portability Map (Late 2026)

| Primitive        | Antigravity CLI (agy)    | Claude Code (claude)       | Codex CLI (codex)         |
|------------------|--------------------------|----------------------------|---------------------------|
| Interactive TUI  | agy                      | claude                     | codex                     |
| Headless pipe    | agy -p --output-format   | claude -p --output-format  | codex exec --json         |
| Project rules    | AGENTS.md / GEMINI.md    | CLAUDE.md (@AGENTS.md)     | AGENTS.md                 |
| Agent Skills     | .agents/skills/SKILL.md  | .claude/skills/SKILL.md    | .agents/skills/SKILL.md   |
| Lifecycle hooks  | .agents/hooks.json       | .claude/settings.json      | hooks / sandbox rules     |
| MCP servers      | .agents/mcp_config.json  | .mcp.json                  | ~/.codex/config.toml      |
| Parallel fleets  | tmux + git worktree      | tmux + git worktree        | tmux + git worktree       |
