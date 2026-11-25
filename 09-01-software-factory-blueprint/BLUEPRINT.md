# Software Factory Blueprint (Prompt -> Live Production)

Reusable `.agents/plugins/software-factory/` + `factory.sh` pipeline
turning one product prompt into a verified, live full-stack application.

## Five-Stage Factory Pipeline
1. `/factory-spec`  Compile 1-paragraph prompt -> `SPEC.md`, SQL + RLS
                    contract, and disjoint lane `PRD.json` stories.
2. `factory.sh`     Provision `tmux` + 3 `git worktree` lanes (`db-api`,
                    `ui-board`, `auth-e2e`), symlink `node_modules`, and
                    seed gitignored `.ralph/` backlogs.
3. `ralph-loops`    Run hardened `ralph.sh` (`--max-iters`, 2x hash
                    circuit breaker, `npm run verify`, Playwright UI gate,
                    root `hooks.json` safety/lint) -> merge 3/3 to `main`.
4. `/factory-audit` Verify `auth.uid()` RLS isolation, read-only Supabase
                    Remote MCP Security Advisors, secret scan & CI YAML.
5. `/factory-ship`  Run `supabase db push --remote` (`shippulse-dev`),
                    sync `vercel env`, open PR -> green CI ->
                    `vercel --prod` + live prod browser smoke test.
