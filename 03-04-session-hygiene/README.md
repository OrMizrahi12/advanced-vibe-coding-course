# Lesson 3.4: Session Hygiene — `/compact`, `/fork`, `/rewind` & Disk-Based Handoffs

Welcome to Lesson 3.4 of **Advanced Vibe Coding**. This kit includes the reusable `SPEC.md`, `PROGRESS.md`, and `HANDOFF.md` disk-handoff templates, the verified reference implementation (`src/credit-ledger.js`) with all 7 `node:test` cases, and the Session Lifecycle Decision Flow cheat sheet.

## Learning Outcomes

1. Choose the right session control at every moment: Stay Active, `/fork` + `/resume`, `/rewind`, `/compact`, or Disk Handoff (`HANDOFF.md` + `/exit`).
2. Test competing designs safely in a speculative `/fork` without polluting your main conversation window, then revert scratch disk edits via Git and return with `/resume`.
3. Erase a broken edit and its failed turn together with `/rewind`, reclaim mid-task headroom with focused `/compact`, and carry exact invariants across fresh zero-rot windows via `@HANDOFF.md`.

## Core Vocabulary

| Term | Definition |
| --- | --- |
| **Speculative fork** | Cloning an active conversation with `/fork` into an independent thread so experimental designs never pollute the main thread's attention. |
| **Compaction** | Summarizing verbose mid-session turns into a compact checkpoint via `/compact <focus note>` while preserving active constraints. |
| **Externalized state** | Storing verified progress, invariants, and exact verification commands in Git-tracked Markdown (`SPEC.md`, `PROGRESS.md`, `HANDOFF.md`) rather than fragile chat memory. |

## Session Lifecycle Decision Flow Cheat Sheet

| Situation | Right Control | Exact Command | Why It Works |
| --- | --- | --- | --- |
| Context is fresh and tests pass | **Stay Active** | Keep shipping | Zero overhead while signal-to-noise ratio is high |
| Testing a competing design or risky spike | **Speculative `/fork` + `/resume`** | `/fork` → prototype → `! git checkout -- <file>` → `/resume` | Keeps rejected experiments and tokens completely out of your main thread |
| An edit broke tests or went down a dead end | **Bad Turn `/rewind`** | `/rewind` → select clean checkpoint | Restores modified files on disk AND strips the failed turn from history together |
| Mid-task thread grew long after research/diffs | **Focused `/compact`** | `/compact Preserve <exact invariants>` | Reclaims token space once or twice mid-task without losing your goal |
| Milestone landed & committed (or 2+ compactions hit) | **Disk Handoff + Fresh Window** | Write `HANDOFF.md` → `/exit` → `agy` → `@HANDOFF.md @SPEC.md ...` | Resets context rot to 0% while passing exact invariants verbatim |

## Interactive `agy` Command Quick Reference

| Command | Effect |
| --- | --- |
| `/fork` | Branches the current conversation into a new independent thread |
| `/resume` | Opens the session picker to switch back to an earlier thread |
| `/rewind` | Restores a prior checkpoint (both file edits and conversation history) |
| `/compact <focus>` | Compresses conversation history while preserving your focus note |
| `! <shell cmd>` | Runs a local shell command inline (e.g. `! npm test`, `! git diff`) |
| `@<file>` | Pins a specific file from disk directly into the prompt |
| `/exit` | Closes the current session cleanly so you can open a zero-rot window |

## Included Files

- [`templates/SPEC.md`](./templates/SPEC.md) — 18-line immutable specification template (`Store Credit Ledger` Milestones 1 & 2).
- [`templates/PROGRESS.md`](./templates/PROGRESS.md) — 10-line milestone checklist and verification contract.
- [`templates/HANDOFF.md`](./templates/HANDOFF.md) — 19-line canonical disk-handoff template (Completed Work, Remaining Task, Open Constraints, Exact Verification Command).
- [`lab-context/src/credit-ledger.js`](./lab-context/src/credit-ledger.js) — Verified Milestone 1 (`applyStoreCredit`) + Milestone 2 (`allocateCreditGrants`) pure ESM reference module.
- [`lab-context/test/credit-ledger.test.js`](./lab-context/test/credit-ledger.test.js) — Verified 7-test `node:test` suite covering partial credit, excess floor, negative guard, FIFO expiry order, expired skip, partial cap, and immutability.
- [`lab-context/package.json`](./lab-context/package.json) — Zero-dependency ESM package manifest for standalone verification.

## Reproducible Hands-On Drill

### 1. Run the Reference Module Standalone

```bash
cd lab-context
npm test && node --check src/credit-ledger.js
```

### 2. Practice the Full Hygiene Cycle in `/workspace/lab-context`

Copy `templates/SPEC.md` and `templates/PROGRESS.md` into `/workspace/lab-context`, start `agy`, and walk through all five controls:

```bash
cp templates/SPEC.md templates/PROGRESS.md /workspace/lab-context/
cd /workspace/lab-context
tmux new -s hygiene-lab
agy --mode accept-edits
```

Inside `agy`:
1. **Milestone 1:** `@SPEC.md @src/invoice.js Implement Milestone 1 applyStoreCredit in src/credit-ledger.js, add 3 unit tests in test/credit-ledger.test.js, and run npm test.` → verify `! npm test` (`pass 10, fail 0`) and commit via `! git add -A && git commit -m "feat(credit): milestone 1"`.
2. **Speculative Fork:** Run `/fork`, paste `@src/credit-ledger.js Prototype a naive Math.floor proportional split by balance (no remainder fix) and run node -e on 1000 cents across three 500-cent grants.` to observe the 1-cent remainder (`333` × 3 = `999`), revert disk with `! git checkout -- src/credit-ledger.js`, and return via `/resume`.
3. **Checkpoint Rollback:** Paste `@src/credit-ledger.js Edit ONLY src/credit-ledger.js now: set remainingDueCents = invoiceTotalCents - availableCreditCents; leave tests untouched.`, see `! npm test` turn red (`pass 9, fail 1`), then run `/rewind` to restore both disk (`! git diff` empty) and green tests (`pass 10, fail 0`).
4. **Focused Compaction:** Inspect Milestone 2 edge cases (`@docs/testing.md @src/invoice.js List all Milestone 2 edge cases for allocateCreditGrants: expired grants, zero balances, expiry ties, and immutability.`), then run `/compact Preserve SPEC.md Milestone 2 rules: integer cents, earliest-expiry first, skip expired grants, immutable input, src/format.js untouched.`
5. **Disk Handoff → Fresh Window:** Generate `HANDOFF.md` (`@SPEC.md @PROGRESS.md Mark Milestone 1 done in PROGRESS.md and write HANDOFF.md (<=15 lines, <=68 chars/line) with completed, Milestone 2, invariants, verify.`), inspect with `! nl -ba HANDOFF.md`, exit via `/exit`, launch a fresh `agy --mode accept-edits`, and finish Milestone 2 on turn one with `@HANDOFF.md @SPEC.md Implement allocateCreditGrants in src/credit-ledger.js, add 4 tests in test/credit-ledger.test.js, mark Milestone 2 done in PROGRESS.md, and run npm test.` → verify `! npm test` (`pass 14, fail 0`) and `! git diff --stat && node --check src/credit-ledger.js`, then `/exit` and commit on `main`.

### 3. Headless Sanity Check (Optional)

```bash
agy -p "Read HANDOFF.md and SPEC.md and verify whether src/credit-ledger.js satisfies every Milestone 2 invariant." --mode plan
```
