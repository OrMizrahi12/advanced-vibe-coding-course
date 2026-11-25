# Lesson 8.3: Row Level Security (RLS) & Production Security Audits With Agents

Welcome to Lesson 8.3 of **Advanced Vibe Coding**. This starter kit includes the owner-scoped Postgres RLS lockdown migration (`supabase/migrations/0002_enable_feedback_rls.sql`), the sanitized read-only Supabase Remote MCP config template (`.agents/mcp_config.example.json`), the Alice-vs-Bob cross-user isolation audit harness (`scripts/rls-audit.mjs`), the zero-dependency secret scanner (`scripts/secret-scan.mjs`), and 5 policy/hygiene unit tests (`test/rls-policy.test.mjs`).

## Owner-Scoped RLS Policy Matrix (`public.feedback_items`)

| Operation | Role Scope | Clause | Protection Enforced |
| --- | --- | --- | --- |
| `SELECT` | `to authenticated` | `using ((select auth.uid()) = user_id)` | Users read only their own rows; `anon` is default-denied |
| `INSERT` | `to authenticated` | `with check ((select auth.uid()) = user_id)` | Prevents spoofing another user's `user_id` on insert |
| `UPDATE` | `to authenticated` | `using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)` | Blocks editing another user's row AND blocks reassigning `user_id` |
| `DELETE` | `to authenticated` | `using ((select auth.uid()) = user_id)` | Users can delete strictly their own rows |

## Why `(select auth.uid())` Matters (`auth_rls_initplan`)

Wrapping `auth.uid()` inside a scalar subselect — `(select auth.uid()) = user_id` — lets the PostgreSQL planner evaluate the caller's UID **once per statement** (`InitPlan`) instead of re-executing the function on every scanned row, eliminating Supabase Performance Advisor `auth_rls_initplan` warnings.

## Privileged Key Bypass Warning

- **Never expose Supabase's privileged server admin key (`service_role` / secret API key) to browsers, client bundles, or public env vars (`NEXT_PUBLIC_*`).** That key bypasses Postgres Row Level Security completely.
- Client code and `scripts/rls-audit.mjs` must use **only** the public `NEXT_PUBLIC_SUPABASE_ANON_KEY` paired with real user JWTs so Postgres enforces RLS identically to production traffic.

## Included Files

- [`supabase/migrations/0002_enable_feedback_rls.sql`](./supabase/migrations/0002_enable_feedback_rls.sql) — 20-line idempotent RLS lockdown migration.
- [`.agents/mcp_config.example.json`](./.agents/mcp_config.example.json) — Sanitized read-only project-scoped Supabase Remote MCP template (`<YOUR_PROJECT_REF>`).
- [`scripts/rls-audit.mjs`](./scripts/rls-audit.mjs) — Two-user (`alice@example.com` vs. `bob@example.com` + `anon`) live cross-user isolation harness.
- [`scripts/secret-scan.mjs`](./scripts/secret-scan.mjs) — 20-line zero-dependency secret & unignored `.env` pre-commit gate.
- [`test/rls-policy.test.mjs`](./test/rls-policy.test.mjs) — `5/5` zero-network SQL policy, isolation verdict, and secret-scanner unit tests.
- [`.gitignore`](./.gitignore) & [`package.json`](./package.json).

## Copy-Paste Reproduction Steps

```bash
# 1. Generate local gitignored .agents/mcp_config.json from template
sed "s/<YOUR_PROJECT_REF>/$SUPABASE_PROJECT_REF/" \
  .agents/mcp_config.example.json > .agents/mcp_config.json

# 2. Prove the unprotected cross-user leak BEFORE enabling RLS (expect EXIT=1)
npm run -s rls:audit; echo "exit_code=$?"

# 3. Check Supabase Security Advisor BEFORE RLS via read-only MCP (prompt immediately after -p!)
agy -p "Using ONLY supabase MCP get_advisors (no shell commands), check security advisors specifically for public.feedback_items. Report exact finding code (e.g. rls_disabled_in_public), level, and count for public.feedback_items in 3 compact plain lines (max 78 chars each). Do not print any project ref, URL, token, or email." \
  --mode plan --output-format json \
  --settings '{"permissions":{"allow":["mcp(supabase/*)"]}}' | jq -r '.response'

# 4. Preview & push the RLS lockdown migration (Supabase CLI v3.3.0 --remote)
supabase db push --remote --dry-run
supabase db push --remote --yes

# 5. Re-run Alice-vs-Bob audit (expect CROSS_USER_ISOLATION_PASS, EXIT=0) & MCP advisor check
npm run -s rls:audit; echo "exit_code=$?"
agy -p "Using ONLY supabase MCP get_advisors (no shell commands), check security and performance advisors specifically for public.feedback_items. Confirm exact counts for rls_disabled_in_public and auth_rls_initplan on public.feedback_items in 3 compact plain lines (max 78 chars each). Do not print any project ref, URL, token, or email." \
  --mode plan --output-format json \
  --settings '{"permissions":{"allow":["mcp(supabase/*)"]}}' | jq -r '.response'

# 6. Run secret-scan gate and all automated unit tests
npm run -s security:check
npm test
```
