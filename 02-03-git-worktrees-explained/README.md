# Lesson 2.3: Git Worktrees Explained — How Multiple Agents Edit One Repo Without Collisions

Welcome to Lesson 2.3 of **Advanced Vibe Coding**. This kit includes the exact zero-dependency `fleet-demo` starter repository built on screen, a printable Git worktree command reference (`worktree-cheatsheet.md`), and a 5-minute hands-on isolation drill.

## Learning Outcomes

1. Explain why multiple parallel terminal agents break inside a single shared working tree (overwritten files, `index.lock` errors, tangled diffs, dirty commits) and how `git worktree` eliminates those collisions.
2. Spawn sibling worktrees (`../wt-api` on `feat/api`, `../wt-ui` on `feat/ui`) in milliseconds, inspect the one-line `.git` `gitdir:` pointer file and `.git/worktrees/<name>` metadata, and verify Git's built-in branch-lock rule.
3. Prove strict workspace isolation across folders, handle untracked `.env` files and dependencies cleanly (dedicated per-worktree `.env` with distinct `PORT`), commit directly into shared Git history, audit worker branches from `main`, and tear down finished worktrees cleanly.

## Core Vocabulary

| Term | Definition |
| --- | --- |
| **Git worktree** | An additional working directory checked out on its own branch and linked directly to your main repository's Git database. |
| **Shared object store** | The single `.git/objects` database in the main repository that every linked worktree reads and writes directly, enabling millisecond creation and instant cross-branch commit visibility. |
| **Workspace isolation** | Dedicated working files and staging `index` per worktree so concurrent terminal agents edit, stage, and run tests simultaneously without `index.lock` contention. |

## Included Files

- [`fleet-demo/`](./fleet-demo/) — Exact zero-dependency Node ESM starter repository (`package.json`, `.gitignore`, `.env.example`, `src/api.js`, `src/ui.js`, `test/app.test.js`) passing `npm test` via `node --test`.
- [`worktree-cheatsheet.md`](./worktree-cheatsheet.md) — Printable command reference covering worktree creation, `.git` pointer inspection, branch locks, `.env`/dependency setup, cross-worktree auditing, and clean teardown.

## Hands-On Worktree Isolation Drill (5 Minutes)

Copy `fleet-demo/` into a fresh workspace folder (for example `/workspace/fleet-demo`), then run:

```bash
cd /workspace/fleet-demo
git init -b main
npm test
git add -A && git commit -m "init fleet demo starter"
cp .env.example .env
```

Now walk through the full parallel-worktree lifecycle:

```bash
# 1. Spawn sibling worktrees in milliseconds
git worktree add ../wt-api -b feat/api
git worktree add ../wt-ui -b feat/ui
git worktree list

# 2. Inspect the one-line .git pointer and dedicated metadata
ls -la ../wt-api
cat ../wt-api/.git
ls -la .git/worktrees/wt-api

# 3. Verify Git's built-in branch lock (expected fatal error)
git worktree add ../wt-dup feat/api

# 4. Edit only ../wt-api/src/api.js and prove Workspace isolation
cat <<'EOF' >> ../wt-api/src/api.js

export function getHealthStatus() {
  return { ok: true, service: "fleet-api", open: getOpenCount() };
}
EOF

git -C ../wt-api status -s   # prints: M src/api.js
git -C ../wt-ui status -s    # blank
git status -s                # blank

# 5. Handle untracked .env with distinct port per worktree and run tests
ls -a && echo "---" && ls -a ../wt-api
cp .env ../wt-api/.env
sed -i 's/3000/3001/' ../wt-api/.env && cat ../wt-api/.env
npm --prefix ../wt-api test

# 6. Commit inside wt-api and inspect shared history directly from main
git -C ../wt-api add src/api.js
git -C ../wt-api commit -m "feat(api): add health status"
git worktree list && echo "" && git log --all --oneline --graph
git diff main..feat/api

# 7. Clean teardown while preserving commit history (then reset to clean main)
git worktree remove ../wt-ui
git worktree remove ../wt-api
git log --all --oneline --graph
git worktree prune -v
git branch -D feat/api feat/ui
git worktree list && git status -s && npm test
```
