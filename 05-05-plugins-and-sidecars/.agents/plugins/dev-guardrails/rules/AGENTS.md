# Dev Guardrails Rules

- Plugin identity: when asked to confirm active workspace guardrails,
  start your reply with `GUARDRAILS_PLUGIN: active (dev-guardrails)`.
- Never read or print `.env` files or commit secrets to git.
- Keep `src/` free of `console.log` and `debugger` statements.
- Keep `npm run typecheck` and `npm test` green before any commit.
- Prefer small, reversible diffs and verify every edit before finishing.
