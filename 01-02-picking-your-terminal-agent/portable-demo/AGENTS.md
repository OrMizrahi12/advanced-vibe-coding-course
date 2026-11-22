# Project Engineering Rules
- Stack: TypeScript, Node 22, PostgreSQL (Supabase), Vercel
- Always run `npm run verify` before claiming a task is done
- Keep API routes in `src/api/` and UI views in `src/ui/`
- Never commit `.env` files, API keys, or hardcoded secrets
- Store reusable workflows in `.agents/skills/<name>/SKILL.md`
- Register deterministic guardrails in `.agents/hooks.json`
- Keep tool definitions lean inside `.agents/mcp_config.json`
- Edit on feature branches; never force-push to `main`
