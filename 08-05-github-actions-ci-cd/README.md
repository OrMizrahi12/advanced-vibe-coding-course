# Lesson 8.5: Automated CI/CD & Agentic PR Gates With GitHub Actions

Welcome to Lesson 8.5 of **Advanced Vibe Coding**. This starter kit provides the least-privilege 39-line GitHub Actions workflow (`.github/workflows/ci.yml`), zero-dependency deploy-config checker (`scripts/ci-deploy-check.mjs`), updated health endpoint (`api/health.mjs` with `region: env.VERCEL_REGION || "iad1"`), workflow contract tests (`test/ci-workflow.test.mjs`), branch-protection API setup, and the agentic `gh run view --log-failed` → `agy -p` self-heal loop.

## GitHub Free Public vs. Private Guide

| Visibility (GitHub Free) | Linux Actions Minutes | Branch Protection (`required_status_checks`) |
| --- | --- | --- |
| **Public repository** | Unlimited free Linux runner minutes | Full branch protection (`strict: true`, `enforce_admins: true`) at `$0` |
| **Private repository** | `2,000` Linux minutes/month | Requires GitHub Pro/Team (`gh api .../protection` returns HTTP 403 on Free) |

## Included Files

- [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) — Exact 39-line workflow enforcing `permissions: contents: read`, `concurrency` cancellation, Node 22 `verify` job (`npm ci`, `typecheck`, `security:check`, `test`, `deploy:check`), and `main`-only opt-in `deploy` job (`needs: verify`).
- [`scripts/ci-deploy-check.mjs`](./scripts/ci-deploy-check.mjs) — 18-line zero-dependency validator checking `vercel.json`, `edge-worker/wrangler.toml`, and `buildHealth()`.
- [`api/health.mjs`](./api/health.mjs) — 20-line fixed serverless endpoint defaulting `region` to `"iad1"`.
- [`test/ci-workflow.test.mjs`](./test/ci-workflow.test.mjs) — `4/4` zero-network workflow security and region-tag tests.
- [`package.json`](./package.json) — Complete `lab-deploy` scripts including `deploy:check` and `verify:ci`.

## Copy-Paste Reproduction Steps

### 1. Run Local CI Parity & Enforce Real Branch Protection on `main`

```bash
npm run verify:ci

gh api --method PUT repos/{owner}/{repo}/branches/main/protection --input - >/dev/null <<'EOF'
{
  "required_status_checks": { "strict": true, "contexts": ["verify"] },
  "enforce_admins": true,
  "required_pull_request_reviews": null,
  "restrictions": null
}
EOF

gh api repos/{owner}/{repo}/branches/main/protection \
  --jq '{branch: "main", strict: .required_status_checks.strict, checks: .required_status_checks.contexts, enforce_admins: .enforce_admins.enabled}'
```

### 2. Agentic Red CI → Self-Heal → Green Squash Merge Loop

> **CLI flag order note:** Always pass the prompt string immediately after `-p`, followed by `--mode accept-edits --output-format json`.

```bash
# Watch PR checks; if verify fails, pull exact failed runner log
gh pr checks --watch --interval 5 || true
RUN_ID=$(gh run list --branch "$(git branch --show-current)" --limit 1 --json databaseId -q '.[0].databaseId')
gh run view "$RUN_ID" --log-failed \
  | grep -E "not ok |Expected values|!==|name:|expected:|actual:|operator:|# (tests|pass|fail)|##\\[error\\]" \
  | sed -E 's/^[^Z]+Z //' | tee /tmp/ci-failed.log

# Pipe failing CI trace straight into headless agy -p for surgical repair
cat /tmp/ci-failed.log | agy -p "The failing GitHub Actions CI log from gh run view --log-failed is provided on stdin (and at /tmp/ci-failed.log). Fix the exact failing region fallback bug on line 13 of api/health.mjs (replace \"unset\" with \"iad1\") so npm run verify:ci passes. Keep api/health.mjs at 20 lines and do not modify any test file. Reply in 2 concise plain lines (max 84 chars each)." \
  --mode accept-edits --output-format json > /tmp/ci-fix.json

# Verify locally, push, confirm GREEN checks, and squash-merge cleanly
npm run verify:ci && git add api/health.mjs && \
  git commit -m "fix(api): default health region tag to iad1" && git push
gh pr checks --watch --interval 5
gh pr merge --squash --delete-branch
MAIN_SHA=$(git rev-parse HEAD)
until RID=$(gh run list --branch main --limit 1 --json databaseId,headSha -q ".[0] | select(.headSha==\"$MAIN_SHA\") | .databaseId") && [ -n "$RID" ]; do sleep 2; done
gh run watch "$RID" --exit-status && gh run view "$RID"
```

### 3. Opt-In Zero-Touch Production Auto-Deploy (Zero Secrets in Git)

When you are ready for `main` pushes to deploy directly to Vercel from GitHub Actions:

```bash
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_PROJECT_ID
gh variable set ENABLE_AUTO_DEPLOY --body true
```
