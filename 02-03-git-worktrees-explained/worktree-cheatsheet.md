# Git Worktrees Cheat Sheet — Parallel Agent Workspaces

A concise, printable reference for every `git worktree` command, isolation rule, and teardown step covered in Lesson 2.3.

---

## 1. Spawning & Listing Worktrees

| Command | What It Does |
| --- | --- |
| `git worktree add ../wt-api -b feat/api` | Create sibling directory `../wt-api` checked out on a new branch `feat/api`. |
| `git worktree add ../wt-ui feat/ui` | Check out an **existing** branch `feat/ui` into sibling directory `../wt-ui`. |
| `git worktree list` | Print every active worktree path, current commit hash, and checked-out branch. |

> **Placement rule:** Create worktrees as **sibling folders** beside the main repository (`../wt-api`, `../wt-ui`), never nested inside the repo root, so `git status`, search tools, and agent file scanners stay clean.

---

## 2. Under the Hood: Shared Object Store vs. Isolated Metadata

| Path | Shared or Isolated? | Purpose |
| --- | --- | --- |
| `fleet-demo/.git/objects` | **Shared** | Single database of all commits, trees, and blobs across every worktree. |
| `../wt-api/.git` | **Plain text file** | One-line pointer: `gitdir: /workspace/fleet-demo/.git/worktrees/wt-api`. |
| `.git/worktrees/wt-api/HEAD` | **Isolated** | Tracks `wt-api`'s checked-out branch independently of `main` and `wt-ui`. |
| `.git/worktrees/wt-api/index` | **Isolated** | Dedicated staging area so concurrent staging never hits `index.lock`. |

Useful inspection commands:

```bash
ls -la ../wt-api                 # leading "-" on .git proves it is a plain file
cat ../wt-api/.git               # prints one-line gitdir: pointer
ls -la .git/worktrees/wt-api     # lists dedicated HEAD, index, commondir, gitdir
```

---

## 3. Branch-Lock Rule (One Branch Per Worktree)

- Git refuses to check out the same branch in two worktrees at once:
  ```text
  fatal: 'feat/api' is already used by worktree at '/workspace/wt-api'
  ```
- Every parallel agent gets its own dedicated feature branch (`feat/api`, `feat/ui`, `feat/tests`), eliminating conflicting `HEAD` advances automatically.

---

## 4. Running Commands & Inspecting Across Worktrees

| Command | What It Does |
| --- | --- |
| `git -C ../wt-api status -s` | Inspect status inside `../wt-api` without changing your current shell directory. |
| `git -C ../wt-api add src/api.js` | Stage edits inside `../wt-api`'s isolated index. |
| `git -C ../wt-api commit -m "..."` | Commit on `feat/api`; written straight into the shared object store. |
| `git log --all --oneline --graph` | View commits from all worktree branches immediately from `main` (zero fetch/pull). |
| `git diff main..feat/api` | Audit a worker branch's full diff directly from the main checkout. |

---

## 5. Untracked Files: `.env` & Dependencies

Git worktrees check out **tracked files only**. Gitignored files such as `.env` and `node_modules/` are intentionally absent in new worktrees:

- **Config (`.env`):** Copy a dedicated `.env` into each worktree and assign a distinct `PORT` (e.g., `3000`, `3001`, `3002`) instead of symlinking one shared file so parallel dev servers never collide.
  ```bash
  cp .env ../wt-api/.env
  sed -i 's/3000/3001/' ../wt-api/.env
  ```
- **Dependencies (`node_modules`):** Run a fast cache-backed install inside each worktree when a project has packages:
  ```bash
  npm --prefix ../wt-api ci --prefer-offline
  # or with pnpm's global content-addressable store:
  pnpm --dir ../wt-api install --prefer-offline
  ```

---

## 6. Safe Teardown & Pruning

| Command | What It Does |
| --- | --- |
| `git worktree remove ../wt-api` | Delete the folder and unregister `.git/worktrees/wt-api` together (refuses if uncommitted edits exist unless `--force` is passed). |
| `git worktree prune -v` | Sweep orphaned admin entries inside `.git/worktrees` after any manual directory deletion outside Git. |
| `git branch -d feat/api` | Delete a merged feature branch (`-D` to force-delete a temporary branch). |

> **History safety:** Removing a worktree deletes only the working folder—every commit made on its branch stays safely stored inside the shared `.git` object store until you explicitly delete the branch.
