# lab-context: Context Index

## Commands & Invariants
- Run tests: `npm test` | Syntax check: `node --check <file>`
- Money uses integer cents (`Math.round`); apply discounts before tax.
- Zero external packages; leave `src/format.js` untouched unless named.
- Scoped rules: `backend/AGENTS.md` (API), `frontend/AGENTS.md` (UI).

## Reference Docs (Load On Demand)
Read ONLY the file matching your task; never preload unrelated docs.

| Task Area | Pointer | Load Only When |
|---|---|---|
| Schema & SQL | `docs/schema.md` | Tables, columns, or migrations |
| HTTP & API | `docs/api-contracts.md` | Routes, headers, or error codes |
| Tests | `docs/testing.md` | Unit tests, fixtures, or mocks |

Done: `npm test` passes and edits stay scoped to the active task.
