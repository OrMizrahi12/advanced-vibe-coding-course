# Software Factory Playbook — 9-Section Checklist

1. Terminal Agent (S1)   Drive `agy` live or headless (`agy -p "<prompt>"`).
2. Tmux + Worktrees (S2) Isolate lanes in `git worktree` + `tmux` panes.
3. Context Hygiene (S3)  Lean `AGENTS.md`, progressive docs, `/compact`, subagents.
4. Agent Skills (S4)     Pack workflows in `SKILL.md` + deterministic `scripts/`.
5. Hooks + Plugins (S5)  Root `hooks.json` (`PreToolUse`, `PostToolUse`, `Stop`).
6. MCP + Browser (S6)    Read-only Supabase MCP, `gh` CLI, headless Playwright.
7. Ralph Loops (S7)      Fresh `ralph.sh` + `npm run verify` + circuit breakers.
8. $0 Cloud Stack (S8)   `supabase db push --remote`, initPlan RLS, CI, Vercel.
9. Factory Ship (S9)     `/factory-spec` -> `factory.sh` -> audit -> prod ship.

## Production Release Gate (Every Ship)
- [ ] `npm run verify` + `secret-scan.mjs` + `rls-smoke.mjs` exit 0
- [ ] Supabase MCP `get_advisors`: 0 `rls_disabled` & 0 `auth_rls_initplan`
- [ ] Green GitHub CI -> `vercel --prod --yes` -> live `prod-smoke.mjs` PASS
