# Lesson 8.1: The $0 Production Architecture — GitHub + Supabase + Vercel + Cloudflare

Welcome to Lesson 8.1 of **Advanced Vibe Coding**. This starter kit encodes real late-2026 free-tier boundaries into an executable stack policy evaluator (`src/stack-policy.mjs`), a cold-wake-aware starter web server (`src/server.mjs`), a privacy-safe CLI readiness probe (`scripts/stack-check.mjs`), and a 6-test zero-dependency verification suite (`test/stack-policy.test.mjs`).

## Verified Late-2026 Free-Tier Boundaries

| Platform | Key Free-Tier Quotas | Commercial Use | Operational Watch-Out |
| --- | --- | --- | --- |
| **GitHub Free** | Unlimited public/private repos; `2,000` private Linux CI min/mo (`unlimited` public CI) | Allowed | Branch protection on GitHub Free requires public repos |
| **Supabase Free** | `2` active projects, `500 MB` Postgres, `50,000` MAU Auth, `5 GB` egress, `1 GB` Storage | Allowed | Projects pause after `7` days of inactivity (rows preserved; handle `503` cold wake) |
| **Vercel Hobby** | `100 GB` transfer/mo, `1,000,000` function invocations/mo, automatic PR Preview URLs | **Non-commercial only** | Use for personal/portfolio projects; never revenue SaaS on Hobby |
| **Cloudflare Free** | Unlimited Pages static bandwidth, `100,000` Worker req/day, `10 ms` CPU | **Allowed** | Best `$0` edge target for commercial/revenue apps |

## Supabase 7-Day Pause & Cold-Wake Playbook

- Reuse a single dev project (`shippulse-dev`, Slot 1 of 2) across development lessons so Slot 2 stays free in reserve.
- Keep `/api/health` cold-wake aware: return `503` with `status: "COLD_WAKE_REQUIRED"` and a retry hint when an idle database is resuming instead of crashing with an opaque `500`.

## Included Files

- [`config/stack-limits.json`](./config/stack-limits.json) — Machine-readable late-2026 quotas across all four platforms.
- [`docs/architecture.md`](./docs/architecture.md) — Single-page `$0 Production Architecture` decision record.
- [`src/stack-policy.mjs`](./src/stack-policy.mjs) — Hobby vs. commercial host router + 2-project Supabase cap guard.
- [`src/server.mjs`](./src/server.mjs) & [`public/index.html`](./public/index.html) — Cold-wake-aware starter HTTP server (`/api/health` + `?db=paused`).
- [`scripts/stack-check.mjs`](./scripts/stack-check.mjs) — Privacy-safe `--cli` version probe & stack policy CLI.
- [`test/stack-policy.test.mjs`](./test/stack-policy.test.mjs) — `6/6` zero-dependency `node:test` suite.
- [`.env.example`](./.env.example), [`.gitignore`](./.gitignore), [`package.json`](./package.json).

## Copy-Paste Quickstart

```bash
# 1. Check installed local & cloud CLIs without printing tokens or emails
node scripts/stack-check.mjs --cli

# 2. Evaluate hobby vs. commercial routing & Supabase 2-project cap
node scripts/stack-check.mjs --hobby
node scripts/stack-check.mjs --commercial --requests-per-day 25000
node scripts/stack-check.mjs --commercial --supabase-projects 3

# 3. Run all 6 automated policy & cold-wake tests
npm test

# 4. Run a read-only agy architecture fit audit (prompt immediately after -p!)
agy -p "Read config/stack-limits.json and docs/architecture.md. Audit a commercial SaaS plan requesting 3 Supabase projects on the \$0 tier. Reply in 3 concise plain lines (max 74 chars each): 1) Supabase slot cap, 2) Vercel vs Cloudflare host choice, 3) 7-day pause guardrail. Do not edit files." \
  --mode plan --output-format json | jq -r '.response'
```
