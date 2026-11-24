# Lesson 3.2: Hierarchical Rules (`AGENTS.md` / `GEMINI.md`) — High-Signal Project Memory

Welcome to Lesson 3.2 of **Advanced Vibe Coding**. This kit includes the exact 3-file hierarchical `AGENTS.md` memory layout (`47` lines / `1,762` bytes combined — a `93.4%` reduction from the `276`-line / `26,840`-byte legacy root dump), the starter `backend/invoice-service.js` and `frontend/receipt-view.js` modules, the context budget & discovery cheat sheet, and the exact verified `agy -p "<prompt>" --mode accept-edits` enforcement commands.

## Learning Outcomes

1. Enforce per-file (`24 KB`) and aggregate (`20,000`-token) rule context budgets before silent truncation drops critical invariants.
2. Author a razor-thin root `AGENTS.md` (`23` lines) alongside scoped `backend/AGENTS.md` (`12` lines) and `frontend/AGENTS.md` (`12` lines) files with zero inferable trivia.
3. Prove automatic local rule enforcement in `backend/` and `frontend/` via bare-bones `agy -p` prompts without repeating a single rule.

## Core Vocabulary

| Term | Definition |
| --- | --- |
| **Hierarchical discovery** | Walking up from the active working directory to the repository root so shared invariants compose automatically with local folder rules. |
| **Context budget** | Hard memory ceilings for always-on rule files: `24,000` bytes per file (line-truncated past the cap) and `20,000` tokens aggregate before overflow demotes to file-path pointers. |
| **Rule deduplication** | Canonical file-path resolution ensuring an inherited rule file loads once per conversation rather than duplicating tokens. |

## Context Budget & Discovery Cheat Sheet

| Layer | Location | Role | Budget / Loading Rule |
| --- | --- | --- | --- |
| **01 · Global Rules** | `~/.agents/AGENTS.md` | Machine-wide personal defaults | Always loaded first |
| **02 · Project Root** | `<repo>/AGENTS.md` (or `GEMINI.md`) | Verified commands, repo-wide invariants, scope pointers, Definition of Done | Loaded for every task (`23` lines / `836` bytes here) |
| **03 · Nested Folders** | `backend/AGENTS.md`, `frontend/AGENTS.md` | Domain-specific API or UI constraints | Loaded ONLY when working inside that folder (`12` lines each) |
| **04 · Budget Guard** | `24,000 B/file` · `20,000 tok` pool | Prevents bloated instructions from crowding out code | Past `24 KB` line-truncates; past `20k` tokens demotes to path pointers |

## Included Files

- [`AGENTS.md`](./AGENTS.md) — Exact 23-line (`836`-byte) trimmed root rules file (`Verified Commands`, `Repo-Wide Invariants`, `Naming & Scope Boundaries`, `Definition of Done`).
- [`backend/AGENTS.md`](./backend/AGENTS.md) — Exact 12-line (`472`-byte) backend rules file (structured `{ ok, data, error }` JSON envelope, pure functions, zero mutable module state).
- [`backend/invoice-service.js`](./backend/invoice-service.js) — Starter backend service module bridging `../src/invoice.js`.
- [`frontend/AGENTS.md`](./frontend/AGENTS.md) — Exact 12-line (`454`-byte) frontend rules file (`data-testid`, semantic HTML with `aria-label`, `sp-` class prefix, zero inline `style=` or `<style>` blocks, HTML escaping).
- [`frontend/receipt-view.js`](./frontend/receipt-view.js) — Starter frontend cent-formatting helper.

## Reproducible Hierarchical Enforcement Walkthrough

> **Prerequisite:** Start from `/workspace/lab-context` on `main` (from Lesson 3.1, with `package.json`, `src/invoice.js`, `src/format.js`, and 7 passing tests in `test/invoice.test.js`).

### 1. Stage the Lean 3-File Hierarchy & Verify the Budget Footprint

```bash
mkdir -p /workspace/lab-context/backend /workspace/lab-context/frontend
cp AGENTS.md /workspace/lab-context/AGENTS.md
cp backend/AGENTS.md backend/invoice-service.js /workspace/lab-context/backend/
cp frontend/AGENTS.md frontend/receipt-view.js /workspace/lab-context/frontend/

cd /workspace/lab-context

# Inspect all 23 root lines on one screen
nl -ba AGENTS.md

# Inspect both 12-line local rule files together
nl -ba backend/AGENTS.md && nl -ba frontend/AGENTS.md

# Measure combined footprint (expect: 47 total lines, 1762 total bytes)
wc -l AGENTS.md backend/AGENTS.md frontend/AGENTS.md && \
  echo "---" && wc -c AGENTS.md backend/AGENTS.md frontend/AGENTS.md
```

### 2. Prove Automatic Local Rule Enforcement Inside `backend/`

> **CLI flag order note:** Always pass the prompt string immediately after `-p`, followed by `--mode accept-edits`. Notice this prompt mentions **zero** JSON envelopes, `ok`/`data`/`error` keys, or pure-function rules — `backend/AGENTS.md` supplies them automatically.

```bash
cd /workspace/lab-context/backend

agy -p \
  "Create concise refund-handler.js (under 22 lines) exporting \
handleRefund(invoiceCents, refundCents) that validates refundCents is a \
positive integer not exceeding invoiceCents and returns remainingCents." \
  --mode accept-edits

# Inspect generated module and prove structured envelopes live
nl -ba refund-handler.js
node -e 'import("./refund-handler.js").then(m => {
  console.log("VALID:", JSON.stringify(m.handleRefund(10000, 2500)));
  console.log("OVERDRAFT:", JSON.stringify(m.handleRefund(10000, 15000)));
})'
```

Expected behavior:
- `VALID` prints `{"ok":true,"data":{"remainingCents":7500},"error":null}`.
- `OVERDRAFT` prints `{"ok":false,"data":null,"error":{"code":"...","message":"..."}}` with zero thrown exceptions and zero frontend `data-testid` / `sp-` leakage.

### 3. Prove Automatic Local Rule Enforcement Inside `frontend/`

Notice this prompt mentions **zero** `data-testid`, `aria-label`, `sp-` class prefix, or inline-style rules — `frontend/AGENTS.md` supplies them automatically while `backend/AGENTS.md` stays out of scope.

```bash
cd /workspace/lab-context/frontend

agy -p \
  "Create concise refund-banner.js (under 22 lines) exporting \
renderRefundBanner(refundCents, remainingCents) returning an HTML string \
showing the refunded and remaining amounts." \
  --mode accept-edits

# Inspect generated module and verify accessibility & styling rules live
nl -ba refund-banner.js
node -e 'import("./refund-banner.js").then(m => {
  const h = m.renderRefundBanner(2500, 7500);
  console.log(h);
  console.log({
    hasTestId: /data-testid=/.test(h), hasAria: /aria-label=/.test(h),
    hasSpClass: /sp-/.test(h), noInlineStyle: !/style=|<style/i.test(h)
  });
})'
```

Expected behavior:
- Output renders semantic `<section>` HTML with `aria-label`, `data-testid`, `sp-` CSS classes, HTML escaping, and `{ hasTestId: true, hasAria: true, hasSpClass: true, noInlineStyle: true }`.

### 4. Verify Root Invariants & Commit Cleanly on `main`

```bash
cd /workspace/lab-context

node --check backend/refund-handler.js \
  frontend/refund-banner.js && npm test --silent && git status -s

# Confirm src/format.js stayed untouched and commit cleanly on main
git add AGENTS.md backend/ frontend/ && \
  git commit -m "Add hierarchical AGENTS.md rules and verified handlers"
```

### 5. Single-Screen Ground-Truth Verification Board

```bash
clear && wc -l -c AGENTS.md backend/AGENTS.md frontend/AGENTS.md && \
  echo "--- LIVE PROOFS ---" && \
  node -e 'import("./backend/refund-handler.js").then(m =>
    console.log("BACKEND:", JSON.stringify(m.handleRefund(10000, 2500))))' && \
  node -e 'import("./frontend/refund-banner.js").then(m => {
    const h = m.renderRefundBanner(2500, 7500);
    console.log("FRONTEND:", JSON.stringify({
      hasTestId: /data-testid=/.test(h), hasAria: /aria-label=/.test(h),
      hasSpClass: /sp-/.test(h), noInlineStyle: !/style=|<style/i.test(h)
    }));
  })' && \
  echo "--- REPO ---" && git status -s && \
  npm test --silent | grep --color=never -E '^# (tests|pass|fail|duration)'
```
