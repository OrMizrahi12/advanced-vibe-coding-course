# Project Rules (lab-context)

## Verified Commands
- Tests: `npm test` (Node native runner)
- Syntax: `node --check <file>`
- Diff audit: `git diff --stat`

## Repo-Wide Invariants
- Store all money as integer cents (`Math.round`).
- Subtract discounts before tax; never tax pre-discount totals.
- Zero external npm dependencies; Node built-ins only.
- Leave `src/format.js` untouched unless explicitly named.

## Naming & Scope Boundaries
- Use kebab-case for new files (e.g., `refund-handler.js`).
- Backend API rules live in `backend/AGENTS.md`.
- Frontend UI rules live in `frontend/AGENTS.md`.
- Deep specs load on demand from `docs/` (never pasted here).

## Definition of Done
- Keep diffs scoped strictly to requested files.
- Run `npm test` and confirm zero failures.
- Never commit secrets, `.env` files, or scratch scripts.
