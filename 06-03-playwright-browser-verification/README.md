# Lesson 6.3: Giving Terminal Agents Eyes — Automated Browser Verification With Playwright

Welcome to Lesson 6.3 of **Advanced Vibe Coding**. This starter kit contains the **ShipPulse Feature Votes** web app (`server.mjs`, `src/votes.mjs`, `public/index.html`, `public/app.js`), the unit test suite (`test/votes.test.mjs`), the exact 25-line zero-download `playwright-core` browser gate (`scripts/verify-ui.mjs`), and the portable `.agents/skills/verify-ui/SKILL.md` skill.

## Zero-Download `playwright-core` + `CHROME_PATH` Cheat Sheet

Installing `playwright-core` (instead of full `playwright`) skips the ~300 MB bundled browser download and reuses your system Chrome/Chromium binary directly:

| OS | Typical `CHROME_PATH` Value |
| --- | --- |
| **Linux** | `/usr/bin/google-chrome` (default in `scripts/verify-ui.mjs`) or `/usr/bin/chromium` |
| **macOS** | `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` |
| **Windows (PowerShell)** | `C:\Program Files\Google\Chrome\Application\chrome.exe` |

> **Linux CI runner tip:** If your Linux CI runner restricts user namespaces, pass `chromiumSandbox: false` inside `chromium.launch(...)`.

## Console/Network Error Gate + Rendered DOM Checklist

1. **Zero `console.error`** events during page load and user interactions.
2. **Zero uncaught `pageerror`** exceptions (catches runtime schema mismatches missed by unit tests and `node --check`).
3. **Zero HTTP `4xx`/`5xx`** responses across assets and API endpoints.
4. **Explicit Rendered DOM assertion** confirming real UI state transition (`42 -> 43`).
5. **Visual proof artifact** (`verify-board.png`) ignored via `.gitignore` and deterministic `finally` teardown (`browser?.close(); srv.kill()`) leaving zero orphan servers.

## Local Playwright Script vs. Browser MCP Comparison

| Dimension | Local `playwright-core` Script (`scripts/verify-ui.mjs`) | Interactive Browser MCP Server |
| --- | --- | --- |
| Turn 1 token cost | `0` startup tokens; single compact JSON line on stdout | Loads 20+ browser tool schemas on Turn 1 |
| Repeatability & CI | Deterministic `npm run verify:ui` exit code (`0` / `1`), works identically in GitHub Actions | Best for exploratory multi-step browsing, heavier for tight edit-verify loops |

## Included Files

- [`package.json`](./package.json) & [`.gitignore`](./.gitignore)
- [`src/votes.mjs`](./src/votes.mjs) & [`test/votes.test.mjs`](./test/votes.test.mjs) — Pure voting logic and `node:test` unit suite (`pass 1, fail 0`).
- [`server.mjs`](./server.mjs) — 25-line zero-dependency HTTP server returning `{"id":"dark-logs","votes":43}` on `POST /api/vote`.
- [`public/index.html`](./public/index.html) & [`public/app.js`](./public/app.js) — ShipPulse Feature Votes UI (fixed version reading `data.votes`).
- [`scripts/verify-ui.mjs`](./scripts/verify-ui.mjs) — Exact 25-line zero-download `playwright-core` verification gate.
- [`.agents/skills/verify-ui/SKILL.md`](./.agents/skills/verify-ui/SKILL.md) — Exact 11-line portable browser verification skill.

## Reproducible Self-Heal Walkthrough

### 1. Install `playwright-core` & Verify Green Baseline

```bash
npm install -D playwright-core
npm test
npm run verify:ui
# Expect: {"ok":true,"dom":"42->43","errors":[]}
```

### 2. Reproduce the Planted Runtime UI Bug & Watch `agy -p` Self-Heal It

1. Edit line 12 of `public/app.js` from `String(data.votes)` to `String(data.stats.total)` and commit the baseline.
2. Confirm unit tests stay green while the Playwright gate catches the real browser crash:

```bash
npm test | grep -E '^# (tests|pass|fail)' && node scripts/verify-ui.mjs | tee /tmp/ui-fail.json; echo "exit=${PIPESTATUS[0]}"
# Expect: {"ok":false,"dom":"42->42","errors":["pageerror: Cannot read properties of undefined (reading 'total')","dom: 42->42"]}  exit=1
```

3. Feed `/tmp/ui-fail.json` straight into headless `agy -p` (prompt immediately after `-p`, followed by `--mode accept-edits --output-format json`):

```bash
agy -p "npm run verify:ui failed with: $(cat /tmp/ui-fail.json). Inspect public/app.js and server.mjs, fix the runtime UI bug without changing server.mjs or breaking npm test, then re-run both npm test and npm run verify:ui until both exit 0 with zero console/page errors and dom 42->43. Reply in 4 compact plain-text lines." \
  --mode accept-edits --output-format json > /tmp/ui-fix-run.json

jq -r '.response' /tmp/ui-fix-run.json && git diff public/app.js && npm run verify:ui
```
