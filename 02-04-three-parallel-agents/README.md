# Lesson 2.4: Running 3 Parallel AI Agents Across Tmux Panes & Worktrees

Welcome to Lesson 2.4 of **Advanced Vibe Coding**. This kit includes the zero-dependency `fleet-demo` starter repository, all three strictly scoped parallel agent briefs (`prompts/api-agent.txt`, `prompts/ui-agent.txt`, `prompts/test-agent.txt`), and the complete 3-pane `tmux` playbook.

## Learning Outcomes

1. Isolate backend, frontend, and test agents across 3 sibling `git worktree` checkouts and 3 labeled `tmux` panes.
2. Dispatch strictly scoped `agy` briefs concurrently across one screen for calm parallel supervision.
3. Zoom each pane (`Ctrl-b z`) to verify single-file ownership, audit diffs, confirm green `npm test` runs, and commit clean branches.

## Core Vocabulary

| Term | Definition |
| --- | --- |
| **File-ownership boundary** | Assigning each parallel agent an exclusive set of files inside its own worktree so concurrent edits never collide. |
| **Scoped brief** | A tight agent prompt naming four elements upfront: one owned file, a concrete deliverable, untouched boundaries, and a local verification command (`npm test`). |
| **Parallel cognition** | Supervising multiple concurrent agent streams by tracking high-level progress and focusing only where judgment matters. |

## Included Files

- [`fleet-demo/`](./fleet-demo/) — Zero-dependency Node ESM starter repository (`package.json`, `.gitignore`, `.env.example`, `src/api.js`, `src/ui.js`, `test/app.test.js`) passing `npm test` via `node --test`.
- [`prompts/api-agent.txt`](./prompts/api-agent.txt) — Scoped brief & exact CLI command for Pane 1 (`../wt-api`, branch `feat/api`).
- [`prompts/ui-agent.txt`](./prompts/ui-agent.txt) — Scoped brief & exact CLI command for Pane 2 (`../wt-ui`, branch `feat/ui`).
- [`prompts/test-agent.txt`](./prompts/test-agent.txt) — Scoped brief & exact CLI command for Pane 3 (`../wt-tests`, branch `feat/tests`).

## 4-Part Scoped Brief Template

Every parallel agent prompt follows this exact 4-part contract:

1. **Owned file:** `Edit ONLY <path>.`
2. **Untouched boundary:** `Do NOT touch <other files>. Keep existing exports unchanged.`
3. **Concrete deliverable:** Exact exported functions, edge-case rules, and return values.
4. **Verification command:** `Run npm test and summarize in 3 short lines.`

> **CLI flag order note:** Always pass the prompt immediately after `-p`, followed by `--mode accept-edits`:
> `agy -p '<prompt>' --mode accept-edits`

## Step-by-Step 3-Pane Parallel Fleet Playbook

### 1. Start from a Clean Baseline & Spawn 3 Sibling Worktrees

If you are starting fresh from this kit, copy `fleet-demo/` into `/workspace/fleet-demo` and initialize Git:

```bash
cd /workspace/fleet-demo
git init -b main
cp .env.example .env
git add -A && git commit -m "init fleet demo starter"
```

Verify a clean `main` branch and spawn all three sibling worktrees:

```bash
git status -sb && npm test

git worktree add ../wt-api -b feat/api
git worktree add ../wt-ui -b feat/ui
git worktree add ../wt-tests -b feat/tests
git worktree list

for d in wt-api wt-ui wt-tests; do cp .env "../$d/.env"; done
```

### 2. Launch the 3-Pane Matrix `tmux` HUD & Label Every Pane

Assumes `~/.tmux.conf` from Lesson 2.2 (with `Ctrl-b |`, `Ctrl-b -`, `Ctrl-b h/j/k/l`, and top pane titles enabled):

```bash
tmux new -s fleet
```

Split into 3 balanced panes:
- Press `Ctrl-b |` to open Pane `2` on the right.
- Press `Ctrl-b -` to open Pane `3` underneath Pane `2`.

Anchor each pane to its dedicated worktree and label every top border:

```bash
# Pane 1 (tall left — press Ctrl-b h)
cd ../wt-api
tmux select-pane -T "API Agent · feat/api"
clear && git branch --show-current

# Pane 2 (top-right — press Ctrl-b l)
cd ../wt-ui
tmux select-pane -T "UI Agent · feat/ui"
clear && git branch --show-current

# Pane 3 (bottom-right — press Ctrl-b j)
cd ../wt-tests
tmux select-pane -T "Test Agent · feat/tests"
clear && git branch --show-current
```

### 3. Dispatch All 3 Scoped `agy` Briefs Concurrently (Non-Blocking)

Fire each command and move immediately to the next pane without waiting:

**Pane 1 (`Ctrl-b h` — `API Agent · feat/api`):**

```bash
agy -p 'Edit ONLY src/api.js. Do NOT touch src/ui.js or test/app.test.js. Keep listTasks and getOpenCount unchanged. Add exported filterTasksByStatus(status) returning matching copied tasks (throw Error if status is not "open" or "done") and getTaskStats() returning { total, open, done }. Run npm test and summarize in 3 short lines.' --mode accept-edits
```

**Pane 2 (`Ctrl-b l` — `UI Agent · feat/ui`):**

```bash
agy -p 'Edit ONLY src/ui.js. Do NOT touch src/api.js or test/app.test.js. Keep renderSummary and renderTaskList unchanged. Add exported renderStatusBadge(status) returning "[DONE]" or "[OPEN]" and renderProgressBar(tasks) returning a concise percentage bar string handling empty arrays safely. Run npm test and summarize in 3 short lines.' --mode accept-edits
```

**Pane 3 (`Ctrl-b j` — `Test Agent · feat/tests`):**

```bash
agy -p 'Edit ONLY test/app.test.js. Do NOT touch src/api.js or src/ui.js. Keep existing tests and add 3 node:test cases verifying listTasks returns defensive copies, renderSummary handles an empty array, and renderTaskList formats open vs done checkboxes accurately. Run npm test and summarize in 3 short lines.' --mode accept-edits
```

### 4. Zoom Each Pane (`Ctrl-b z`), Audit Diffs, Verify Tests & Commit

**Pane 1 (`Ctrl-b h`, then `Ctrl-b z`):**

```bash
git status -s                                       # Expect: M src/api.js
git diff --stat && git diff src/api.js
npm test                                            # Expect: pass 2, fail 0
git add src/api.js && git commit -m "feat(api): add status filter and stats"
# Press Ctrl-b z to unzoom
```

**Pane 2 (`Ctrl-b l`, then `Ctrl-b z`):**

```bash
git status -s                                       # Expect: M src/ui.js
git diff --stat && npm test                         # Expect: pass 2, fail 0
git add src/ui.js && git commit -m "feat(ui): add status badge and progress bar"
# Press Ctrl-b z to unzoom
```

**Pane 3 (`Ctrl-b j`, then `Ctrl-b z`):**

```bash
git status -s                                       # Expect: M test/app.test.js
git diff --stat && npm test                         # Expect: pass 5, fail 0
git add test/app.test.js && git commit -m "test(app): add api and ui edge-case tests"
# Press Ctrl-b z to unzoom
```

### 5. Fleet-Wide Ground-Truth Graph Check

Zoom Pane 1 (`Ctrl-b h`, `Ctrl-b z`) and inspect the unified Git history across all three sibling branches:

```bash
git log --all --oneline --graph -n 8 && echo "" && git worktree list
```

Leave `/workspace/fleet-demo` and all three committed worktrees (`../wt-api`, `../wt-ui`, `../wt-tests`) intact if you are continuing directly into Lesson 2.6 to audit, resolve a conflict, merge, and tear them down cleanly.
