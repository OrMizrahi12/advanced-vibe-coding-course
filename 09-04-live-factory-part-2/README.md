# Lesson 9.4: Live Factory Run (Part 2) — Database Push, Prod Deploy, Live Smoke Test & Playbook

This capstone student kit packages every Stage 4–5 release artifact, verification gate, serverless production route, portable `.agents/plugins/software-factory/` bundle, and the 16-line 9-section **`PLAYBOOK.md`** from Lesson 9.4 of **Advanced Vibe Coding**.

## Learning Outcomes

1. Push per-operation `(select auth.uid())` initPlan Row Level Security migrations to cloud Supabase (`supabase db push --remote --yes`), prove cross-user isolation (`scripts/rls-smoke.mjs`), and pass `/factory-audit` with zero Security Advisor warnings.
2. Gate releases behind least-privilege GitHub Actions CI (`.github/workflows/ci.yml`), sync Vercel environment variables over `stdin` (`vercel env add`), and ship live via `vercel --prod --yes`.
3. Verify cloud Postgres persistence across a full browser reload with headless Chrome (`scripts/prod-smoke.mjs`) and carry home your repeatable 9-section Software Factory Playbook.

## Core Vocabulary

| Term | Definition |
| --- | --- |
| **Live RLS verification** | Proving public reads, owner-only mutations, and admin gates directly against live cloud Postgres using synthetic test users (`alice@example.com` vs. `bob@example.com`) and only the public anon key. |
| **Production smoke test** | Running an automated headless Chrome check against the live production URL right after deploy to verify real sign-in, writes, reload persistence, and zero console or HTTP errors. |
| **Repeatable Software Factory** | A version-controlled bundle of rules, skills, hooks, parallel worktree orchestrators, and cloud release checks dropped into any repository to ship prompt-to-production software consistently. |

## Kit Manifest

| Path | Purpose |
| --- | --- |
| `PLAYBOOK.md` | Exact 16-line 9-section Software Factory checklist + Production Release Gate |
| `supabase/migrations/20261123090400_shippulse_rls_prod.sql` | Strict per-operation `(select auth.uid())` + `((select auth.jwt()) -> 'app_metadata')` initPlan RLS + idempotent demo seeds |
| `scripts/secret-scan.mjs` | 20-line zero-dependency secret & `.env` hygiene scanner |
| `scripts/rls-smoke.mjs` | Automated cross-user `alice@example.com` vs. `bob@example.com` + `anon` RLS isolation test |
| `scripts/prod-smoke.mjs` | Headless `playwright-core` + Chrome live production sign-in, upvote, reload & cleanup check |
| `scripts/validate-factory.mjs` | Deterministic plugin manifest, root `hooks.json`, read-only MCP & `factory.sh` validator |
| `factory.sh` | 4-pane `tmux` + 3-worktree parallel Ralph Wiggum orchestrator (`--dry-run` supported) |
| `.github/workflows/ci.yml` | 21-line least-privilege GitHub Actions PR gate (`contents: read`, Node 22, `actions/checkout@v7`) |
| `vercel.json` + `api/*.mjs` + `public/index.html` | Lean JWT-forwarding Vercel app (`"framework": null`, zero `service_role` key on the server) |
| `tests/release-gates.test.mjs` | 4 offline unit tests covering RLS SQL, secret scanning, CI/Vercel rules, JWT client helper, and `PLAYBOOK.md` |
| `.agents/plugins/software-factory/` | Complete drop-in plugin (`plugin.json`, `rules/AGENTS.md`, 4 skills, root `hooks.json`, 4 hooks, read-only `mcp_config.json`) |
| `.env.example` & `.gitignore` | Sanitized environment template and ignore rules (never commit `.env*`) |

## Step-by-Step Reproduction Guide (Stages 4 & 5)

### 1. Local Offline Validation (No Cloud Accounts Required)

```bash
# Validate the portable software-factory plugin bundle (zero dependencies)
node scripts/validate-factory.mjs

# Run release-gate unit tests (4/4 PASS; install @supabase/supabase-js in your project first)
npm install @supabase/supabase-js
node --test tests/release-gates.test.mjs
```

### 2. Stage 4: Cloud Database Push, Cross-User RLS Proof & `/factory-audit`

Copy `.env.example` to `.env` (`chmod 600 .env`, already ignored by `.gitignore`), fill in your Supabase Free-Tier project values, and source `.env` in your shell:

```bash
set -a && source .env && set +a
npm install @supabase/supabase-js
npm install -D supabase playwright-core
export PATH="$PWD/node_modules/.bin:$PATH"

# Link your existing Supabase project and push initPlan RLS migrations
supabase init
supabase link --project-ref "$SUPABASE_PROJECT_REF"
supabase db push --remote --dry-run
supabase db push --remote --yes

# Prove cross-user Postgres RLS isolation (public anon key only)
node scripts/rls-smoke.mjs

# Run read-only /factory-audit via Antigravity CLI (prompt MUST immediately follow -p)
agy -p "/factory-audit Run the security audit read-only (no file edits, no shell commands): call Supabase Remote MCP get_advisors (both security and performance) specifically for public.features, public.votes, and public.changelogs, read /tmp/rls-smoke-summary.txt, and output 5 concise plain-text lines." \
  --mode plan --output-format json \
  --settings '{"permissions":{"allow":["mcp(supabase/*)"]}}' > /tmp/factory-audit.json
jq -r '.response' /tmp/factory-audit.json

# Run direct secret hygiene check before committing
node scripts/secret-scan.mjs
```

### 3. Stage 5: Green GitHub Actions CI, Stdin-Piped Vercel Env Sync & Live Smoke Test

```bash
# Push a release branch to your dedicated app repository and verify clean-room CI
git checkout -b release/v1-shippulse
git add .github/workflows/ci.yml scripts/prod-smoke.mjs
git commit -m "ci(release): add GitHub Actions release gate and prod smoke test"
git push -u origin release/v1-shippulse
gh pr create --title "Release ShipPulse v1.0 (CI + Prod Smoke)" --body "Verified via Software Factory Stage 4-5."
gh pr checks --watch
gh pr merge --squash --delete-branch
git checkout main && git pull --ff-only

# Link Vercel, pipe production env vars over stdin (zero secrets in argv/history), and ship live
vercel link --yes
printf '%s' "$PUBLIC_SUPABASE_URL" | vercel env add PUBLIC_SUPABASE_URL --environment production --type config --force --yes
printf '%s' "$PUBLIC_SUPABASE_ANON_KEY" | vercel env add PUBLIC_SUPABASE_ANON_KEY --environment production --type config --force --yes
printf '%s' "production" | vercel env add APP_ENV --environment production --type secret --force --yes

PROD_URL=$(vercel --prod --yes 2>/tmp/vercel-prod.log | grep -Eo 'https://[^[:space:]]+\.vercel\.app' | tail -n 1)
ALIAS_URL=$(awk '/Aliased/{print $NF}' /tmp/vercel-prod.log | tail -n 1)
PROD_URL="${ALIAS_URL:-$PROD_URL}"
curl -sS -w '\nHTTP=%{http_code}\n' "$PROD_URL/api/health" | jq -Rr 'fromjson? // .'

# Run headless Chrome production smoke test proving post-reload cloud Postgres persistence
PROD_URL="$PROD_URL" TMPDIR=/tmp node scripts/prod-smoke.mjs
```

## Adapting the Software Factory to Any Future Project

1. Copy `.agents/plugins/software-factory/`, `factory.sh`, `scripts/validate-factory.mjs`, `scripts/secret-scan.mjs`, `.github/workflows/ci.yml`, and `PLAYBOOK.md` into your new repository.
2. Write a crisp one-paragraph product brief and run `/factory-spec` to generate `SPEC.md`, SQL with `ENABLE ROW LEVEL SECURITY` + `(select auth.uid())`, and disjoint worktree backlogs.
3. Launch `./factory.sh --dry-run` first, then run `./factory.sh` to drive parallel `tmux` + `git worktree` Ralph loops under deterministic backpressure.
4. Walk down the three checkboxes at the bottom of `PLAYBOOK.md` before every production release.
