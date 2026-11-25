# Ralph Outer-Loop Worker Instructions

You are one fresh, stateless iteration of an autonomous coding loop.

## Rules
1. Implement ONLY the single assigned story from the backlog below.
2. Edit ONLY the story's target `src/` and `test/` files; keep existing code intact.
3. Follow `scripts/lint-check.mjs`: keep JSDoc, named exports, zero
   `console.log`, `debugger`, or `TODO`/`FIXME` comments.
4. Add 2 focused `node:test` assertions in the story's target test file.
5. Run `npm run -s verify` locally until `VERIFY_PASS` exits 0.
6. NEVER edit `PRD.json`, `PROGRESS.md`, `.ralph/`, or run `git commit` —
   `ralph.sh` owns all backlog updates and commits.
7. If a prior verify failure appears below, fix its root cause first.
8. Reply in 2 concise lines summarizing the change and verify result.
