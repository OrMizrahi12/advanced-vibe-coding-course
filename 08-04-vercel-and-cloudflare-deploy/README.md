# Lesson 8.4: Shipping to Vercel & Cloudflare From the Terminal — Preview vs. Production

Welcome to Lesson 8.4 of **Advanced Vibe Coding**. This starter kit includes the minimal Vercel serverless config and cold-wake health endpoint (`vercel.json`, `api/health.mjs`, `public/index.html`), the companion Cloudflare Free edge worker (`edge-worker/wrangler.toml`, `edge-worker/src/index.js`), 6 zero-network deploy-target unit tests (`test/deploy-targets.test.mjs`), and exact Preview → Production → Rollback & Wrangler CLI workflows.

## Vercel Hobby vs. Cloudflare Free Licensing Summary

- **Vercel Hobby (`$0`):** Instant PR Preview URLs, serverless API routes, `100 GB` transfer/mo, `1M` invocations/mo — strictly **non-commercial / hobby / portfolio** use.
- **Cloudflare Free (`$0`):** Unlimited Pages static bandwidth, `100,000` Worker requests/day, `10 ms` CPU — **commercial/revenue projects allowed**. Keeping both configs lightweight prevents vendor lock-in.

## Included Files

- [`vercel.json`](./vercel.json) — 10-line Vercel config setting `framework: null`, `outputDirectory: "public"`, and bundling `config/stack-limits.json`.
- [`api/health.mjs`](./api/health.mjs) — 20-line Web Standard ESM serverless endpoint reusing `src/stack-policy.mjs` with `503 COLD_WAKE_REQUIRED` handling.
- [`public/index.html`](./public/index.html) — Minimal static landing page referencing `/api/health` and `/api/edge-status`.
- [`edge-worker/wrangler.toml`](./edge-worker/wrangler.toml) — 9-line Cloudflare Worker config pinning `compatibility_date = "2026-11-22"` and `workers_dev = true`.
- [`edge-worker/src/index.js`](./edge-worker/src/index.js) — 18-line zero-dependency Worker serving `200` on `/api/edge-status` and `404` JSON fallback.
- [`test/deploy-targets.test.mjs`](./test/deploy-targets.test.mjs) — `6/6` zero-network deploy-target unit tests.
- [`.gitignore`](./.gitignore) — Excludes `.env`, `.vercel/`, `.wrangler/`, and `edge-worker/.wrangler/`.

## Part A — Vercel CLI: Stdin-Piped Env Scoping, Preview → Production & Rollback

Never pass secret values via CLI flags (`--value`); always pipe over `stdin` so values stay out of process lists and shell history:

```bash
# 1. Link project cleanly (.vercel/ stays gitignored)
vercel link --yes

# 2. Scope Preview vs. Production environment variables via stdin pipe
printf '%s' "$NEXT_PUBLIC_SUPABASE_URL"      | vercel env add NEXT_PUBLIC_SUPABASE_URL --environment preview --type config --force --yes
printf '%s' "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY --environment preview --type config --force --yes
printf '%s' "preview"                        | vercel env add APP_ENV --environment preview --type secret --force --yes

printf '%s' "$NEXT_PUBLIC_SUPABASE_URL"      | vercel env add NEXT_PUBLIC_SUPABASE_URL --environment production --type config --force --yes
printf '%s' "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY --environment production --type config --force --yes
printf '%s' "production"                     | vercel env add APP_ENV --environment production --type secret --force --yes

vercel env ls

# 3. Deploy Preview, smoke-test 200 OK & 503 cold-wake, inspect logs
PREVIEW_URL=$(vercel --yes | grep -Eo 'https://[^[:space:]]+\.vercel\.app' | tail -n 1)
curl -sS "$PREVIEW_URL/api/health" | jq .
curl -sS -w '\nHTTP=%{http_code}\n' "$PREVIEW_URL/api/health?db=paused"
vercel logs requests --deployment "$PREVIEW_URL" --limit 6

# 4. Promote to Production & verify rollback readiness
PROD_URL=$(vercel --prod --yes | grep -Eo 'https://[^[:space:]]+\.vercel\.app' | tail -n 1)
curl -sS "$PROD_URL/api/health" | jq .
vercel ls --environment production --status READY
vercel rollback --help
```

## Part B — Read-Only `agy -p` Pre-Deploy Audit & Cloudflare Wrangler Deploy

> **CLI flag order note:** Pass the prompt string immediately after `-p`, followed by `--mode plan --output-format json`.

```bash
# 1. Pre-ship read-only config & secret hygiene audit
agy -p "Read vercel.json, edge-worker/wrangler.toml, and .gitignore, and run 'npm run -s security:check' read-only without editing any file. Confirm 4 items in 4 short plain lines (max 76 chars each): 1) vercel.json outputDirectory & includeFiles, 2) wrangler.toml compatibility_date & workers_dev, 3) .gitignore excludes .vercel/ and edge-worker/.wrangler/, 4) security:check result. Do not print any URL, token, account ID, or email." \
  --mode plan --output-format json | jq -r '.response'

# 2. Dry-run bundle locally, then deploy live edge worker & smoke-test both routes
(cd edge-worker && npx --no-install wrangler deploy --dry-run)
WORKER_URL=$(cd edge-worker && npx --no-install wrangler deploy 2>&1 | grep -Eo 'https://[^[:space:]]+\.workers\.dev' | tail -n 1)
curl -sS "$WORKER_URL/api/edge-status" | jq .
curl -sS -w '\nHTTP=%{http_code}\n' "$WORKER_URL/missing"

# 3. Verify all local tests, typecheck & secret scanner
npm test && npm run typecheck && npm run -s security:check
```
