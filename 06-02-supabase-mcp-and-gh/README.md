# Lesson 6.2: Live Infrastructure Tools — Supabase Remote MCP & GitHub CLI (`gh`)

Welcome to Lesson 6.2 of **Advanced Vibe Coding**. This starter kit includes the project-scoped, read-only Supabase Remote MCP configuration (`.agents/mcp_config.json`), the seed SQL for `public.release_votes` (`sql/seed-release-votes.sql`), the idempotent RLS remediation draft (`docs/rls-remediation.sql`), the zero-dependency `node:test` verification guard (`test/rls-doc.test.mjs`), and exact copy-paste reproduction commands pairing Supabase Remote MCP with zero-token `gh` CLI workflows.

## Supabase Remote MCP Query Parameters

| Parameter | Value Used | Security & Budget Purpose |
| --- | --- | --- |
| `project_ref` | `<YOUR_PROJECT_REF>` | Pins MCP access strictly to a single development project so agents cannot cross into other projects |
| `read_only` | `true` | Blocks mutating SQL and migration tools (`apply_migration`, destructive DDL) at the MCP layer |
| `features` | `database,debugging` | Limits loaded tool schemas to schema introspection (`list_tables`), read-only `execute_sql`, and `get_advisors` |

## OAuth 2.1 Security Checklist

- **Never paste database passwords, personal access tokens, or admin API keys into `.agents/mcp_config.json`:** Connect via `https://mcp.supabase.com/mcp` and complete OAuth 2.1 dynamic client registration inside your browser.
- **Keep `project_ref` scoped to a dedicated dev project:** Free Tier gives you `2` active Postgres projects (`500 MB` each, `50,000` MAU Auth). Provision **one** reusable dev project (`shippulse-dev`) for Sections 6, 8, and 9 while keeping slot 2 free.
- **Verify zero secrets in Git:** Confirm `.agents/mcp_config.json` holds only public URL parameters (never credentials).

## `gh` CLI vs. 60-Tool GitHub MCP Comparison

| Dimension | Native GitHub CLI (`gh`) | Full GitHub MCP Server (~60 tools) |
| --- | --- | --- |
| Turn 1 startup token cost | **`0` tokens** | Thousands of tokens loaded into every turn |
| Auth hygiene | `gh auth login --web` over HTTPS (no raw tokens in repo files) | Requires PAT or OAuth MCP wiring |
| Best workflow | Issues, branches, PR creation, CI logs (`gh issue view`, `gh pr create`, `gh run watch`) | Only when shell access is unavailable |

## Included Files

- [`.agents/mcp_config.json`](./.agents/mcp_config.json) — Sanitized 20-line MCP configuration with `<YOUR_PROJECT_REF>`, `read_only=true`, and `features=database,debugging`.
- [`sql/seed-release-votes.sql`](./sql/seed-release-votes.sql) — 11-line seed script creating `public.release_votes` with RLS initially disabled so `get_advisors` flags a real `rls_disabled_in_public` warning.
- [`docs/rls-remediation.sql`](./docs/rls-remediation.sql) — Idempotent `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + authenticated `SELECT` policy remediation draft.
- [`test/rls-doc.test.mjs`](./test/rls-doc.test.mjs) — Zero-dependency `node:test` guard verifying RLS clauses in `docs/rls-remediation.sql`.

## Reproducible Walkthrough

### 1. Seed `public.release_votes` in Your Dev Project & Configure `.agents/mcp_config.json`

1. Create one Free-Tier Supabase project named `shippulse-dev` and copy its 20-character project ref from `https://supabase.com/dashboard/project/<YOUR_PROJECT_REF>`.
2. Run [`sql/seed-release-votes.sql`](./sql/seed-release-votes.sql) once in the Supabase SQL Editor.
3. Replace `<YOUR_PROJECT_REF>` inside `.agents/mcp_config.json`, validate JSON (`python3 -m json.tool .agents/mcp_config.json >/dev/null`), and authenticate interactively via `agy` → `/mcp` → `supabase` → Authorize.

### 2. Inspect Live Tables & Run Security Advisors (Read-Only MCP)

> **CLI flag order & headless MCP note:** Always pass the prompt string immediately after `-p`, followed by `--mode plan`, scoped `--settings '{"permissions":{"allow":["mcp(supabase/*)"]}}'` (required for headless MCP calls), and `--output-format json`.

```bash
agy -p "Using ONLY supabase MCP tools (no shell commands), call list_tables on public and run a read-only SELECT version, env, status, votes FROM public.release_votes ORDER BY version. Reply in 4 compact plain-text lines (<=82 chars each): line 1 table name and RLS status, lines 2-4 the 3 rows." \
  --mode plan --effort low \
  --settings '{"permissions":{"allow":["mcp(supabase/*)"]}}' \
  --output-format json > /tmp/supa-tables.json
jq -r '.response' /tmp/supa-tables.json && jq -c '{status, in_tok: (.usage.input_tokens // .usage.prompt_tokens)}' /tmp/supa-tables.json

agy -p "Using ONLY supabase MCP tools (no shell commands): (1) call get_advisors for security and performance, (2) verify whether apply_migration is absent from your toolset, and (3) attempt UPDATE public.release_votes SET votes=votes WHERE false via execute_sql to verify read_only=true enforcement. Reply in 5 compact plain-text bullet lines (no markdown links, <=88 chars per line)." \
  --mode plan --effort low \
  --settings '{"permissions":{"allow":["mcp(supabase/*)"]}}' \
  --output-format json > /tmp/supa-advisors.json
jq -r '.response' /tmp/supa-advisors.json | tee /tmp/supa-finding.txt
```

### 3. Pair With Zero-Token `gh` CLI to Open an Issue & Autonomous Remediation PR

```bash
gh auth status
gh repo create lab-mcp --private --source=. --push
gh issue create \
  --title "Enable RLS on public.release_votes" \
  --body "Supabase Security Advisor flagged rls_disabled_in_public on public.release_votes. Draft idempotent RLS migration SQL in docs/rls-remediation.sql and add test/rls-doc.test.mjs."

agy -p "Read GitHub issue #1 using gh issue view 1. From main, create branch feat/rls-remediation-doc, create docs/rls-remediation.sql with idempotent ALTER TABLE public.release_votes ENABLE ROW LEVEL SECURITY and a read-only SELECT policy for authenticated users, add test/rls-doc.test.mjs using node:test and node:assert/strict to verify docs/rls-remediation.sql contains ENABLE ROW LEVEL SECURITY and CREATE POLICY, run npm test until all tests pass, commit on feat/rls-remediation-doc, push origin, and open a pull request titled 'docs: add RLS remediation SQL for release_votes' referencing Closes #1 via gh pr create. Reply in 4 compact plain-text lines (<=84 chars each)." \
  --mode accept-edits --effort low --output-format json > /tmp/gh-pr-run.json

jq -r '.response' /tmp/gh-pr-run.json && gh pr list && gh pr view --json number,title,state,headRefName
npm test | grep -E '^# (tests|pass|fail)'
```
