# Lesson 8.2: Supabase From the Terminal — Schema, Migrations, Auth & Typed Queries

Welcome to Lesson 8.2 of **Advanced Vibe Coding**. This starter kit provides the versioned SQL migration (`supabase/migrations/0001_create_feedback_items.sql`), strict TypeScript client and query modules (`src/lib/supabase.ts`, `src/lib/feedback.ts`, `src/lib/database.types.example.ts`), masked Auth round-trip verification (`src/lib/auth.mjs`, `scripts/verify-auth-flow.mjs`), and zero-network schema tests (`test/supabase-schema.test.mjs`).

## Supabase CLI v3.3.0 `--remote` vs. Legacy `--linked` Cheatsheet

Supabase CLI `v3.3.0` standardized remote project targeting on `--remote` (replacing the deprecated `--linked` flag) and outputs unformatted TypeScript from `gen types`, which `oxfmt` formats cleanly in milliseconds:

| Task | Supabase CLI v3.3.0 Command (`--remote`) | Notes |
| --- | --- | --- |
| Initialize repo | `supabase init` | Creates `supabase/config.toml` and gitignored `supabase/.temp/` |
| Link cloud project | `supabase link --project-ref "$SUPABASE_PROJECT_REF"` | Reuses Slot 1 dev project (`shippulse-dev`) |
| List remote migrations | `supabase migration list --remote` | Verifies local vs. cloud schema history |
| Dry-run push | `supabase db push --remote --dry-run` | Previews exact pending DDL before applying |
| Push live & prove idempotency | `supabase db push --remote --yes` | Second run prints `Remote database is up to date.` |
| Generate & format TypeScript types | `supabase gen types typescript --remote --schema public > src/lib/database.types.ts && oxfmt src/lib/database.types.ts` | Zero deprecation warnings; feeds `tsc --noEmit` |

## Zero-Secret `.env` Setup & Dev vs. Prod Email Confirmation

1. Copy `.env.example` to `.env` (`chmod 600 .env`) and fill in your `shippulse-dev` credentials. Confirm `.gitignore` excludes `.env` and `supabase/.temp/` (`git status -s` stays blank).
2. **Dev vs. Prod Auth Email Confirmation:** In your **development** Supabase project (`Authentication → Providers → Email`), turn **"Confirm email" OFF** so terminal tests receive an active JWT immediately without hitting the 2-email/hr built-in SMTP rate limit. Re-enable email confirmation with a custom SMTP provider in **production**.

## Included Files

- [`supabase/migrations/0001_create_feedback_items.sql`](./supabase/migrations/0001_create_feedback_items.sql) — 11-line idempotent DDL with `auth.users(id)` FK and index.
- [`tsconfig.json`](./tsconfig.json) — Strict `noEmit` TypeScript config checking `src/lib/**/*.ts`.
- [`src/lib/database.types.example.ts`](./src/lib/database.types.example.ts) — Offline starter schema types (copy to `database.types.ts` for offline practice, or overwrite live via `npm run db:types`).
- [`src/lib/supabase.ts`](./src/lib/supabase.ts) & [`src/lib/feedback.ts`](./src/lib/feedback.ts) — Typed `createClient<Database>` client and `createFeedback()` helper.
- [`src/lib/auth.mjs`](./src/lib/auth.mjs) & [`scripts/verify-auth-flow.mjs`](./scripts/verify-auth-flow.mjs) — Masked sign-up / sign-in / typed insert round-trip verification script.
- [`test/supabase-schema.test.mjs`](./test/supabase-schema.test.mjs) — `4/4` zero-network schema, type, and Auth helper unit tests.
- [`.gitignore`](./.gitignore), [`package.json`](./package.json), [`.env.example`](./.env.example).

## Copy-Paste Reproduction Steps

```bash
# 1. Install SDK, Supabase CLI v3.3.0+, TypeScript, and oxfmt locally
npm install @supabase/supabase-js && npm install -D supabase typescript oxfmt
export PATH="$PWD/node_modules/.bin:$PATH"

# 2. Load gitignored .env into shell memory (never echo raw secrets!)
set -a && source .env && set +a

# 3. Initialize & link project
supabase init
supabase link --project-ref "$SUPABASE_PROJECT_REF"
supabase migration list --remote

# 4. Scaffold & author migration with headless agy -p (prompt immediately after -p!)
supabase migration new create_feedback_items
agy -p "Edit the newest supabase/migrations/*_create_feedback_items.sql to exact 11 lines (max 80 chars/line): line 1 comment '-- Versioned migration: public.feedback_items (RLS lockdown follows next)', lines 2-8 (no blank line after line 1) 'create table if not exists public.feedback_items (' with id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text not null check (char_length(trim(title)) between 3 and 120), votes integer not null default 0 check (votes >= 0), created_at timestamptz not null default now() and ');', line 9 blank, lines 10-11 two-line 'create index if not exists feedback_items_user_id_idx' then '  on public.feedback_items (user_id);'. Leave RLS off. Reply in 2 concise lines (<= 80 chars)." \
  --mode accept-edits --output-format json

# 5. Preview, push live, generate types, verify compile-time safety & run Auth round-trip
supabase db push --remote --dry-run
supabase db push --remote --yes
npm run db:types
npm run typecheck
npm run auth:verify
npm test
```
