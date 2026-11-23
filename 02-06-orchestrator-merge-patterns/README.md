# Lesson 2.6: Orchestrator + Worker Patterns & Clean Branch Merging

Welcome to Lesson 2.6 of **Advanced Vibe Coding**. This kit provides the reusable read-only fleet audit script (`scripts/audit-fleet.sh`), the exact conflict-resolution prompt template (`prompts/resolve-conflict.txt`), and the complete Integrator Gate & Worktree Teardown cheatsheet.

## Learning Outcomes

1. Audit parallel worker branches from a dedicated `tmux` Integrator pane using triple-dot `git diff main...<branch>` and read-only `agy -p "..." --mode plan`.
2. Integrate verified branches sequentially with `git merge --no-ff` and resolve a shared-file `package.json` merge conflict cleanly under `git diff --check` and tests.
3. Execute safe Worktree teardown (`git worktree remove`, `git worktree prune -v`, and lowercase `git branch -d`) to leave `main` spotless and green.

## Core Vocabulary

| Term | Definition |
| --- | --- |
| **Fan-out / fan-in** | Dispatching parallel worker tasks across isolated worktree branches, then auditing, testing, and merging every verified branch back into `main`. |
| **Integrator agent** | A dedicated coordinator pane on `main` that audits worker diffs, gates sequential merges, resolves conflicts under tests, and protects trunk health. |
| **Worktree teardown** | Removing finished sibling worktrees, pruning stale metadata, and safely deleting merged branches once `main` passes every check. |

## Included Files

- [`scripts/audit-fleet.sh`](./scripts/audit-fleet.sh) — Reusable bash script running `git diff --stat main...$b` across worker branches followed by the exact read-only `xargs -0 -I{} agy -p "..." --mode plan` architectural audit (pass `--stat-only` to run only the Git scope check).
- [`prompts/resolve-conflict.txt`](./prompts/resolve-conflict.txt) — Exact Integrator agent conflict-resolution brief, exact CLI command, and independent verification sequence.

## Integrator Gate & Clean Merge Playbook

### 1. Launch the 2-Pane Coordinator `tmux` HUD

Run from `/workspace/fleet-demo` on `main`:

```bash
tmux new -s integrate
# Press Ctrl-b | to split Pane 2 on the right

# Pane 2 — Fleet Watch · branches
tmux select-pane -T "Fleet Watch · branches" && clear && git worktree list

# Press Ctrl-b h into Pane 1 — Integrator · main, then Ctrl-b z to zoom full width
tmux select-pane -T "Integrator · main" && clear
```

Inspect baseline history and green tests on `main`:

```bash
git log --all --oneline --graph -n 8
git status -s && npm test
```

### 2. Triple-Dot Diff Scope Check & Read-Only `agy` Audit

Always use triple-dot syntax (`main...$b`) so Git isolates only the commits added since the worker branched off `main`:

```bash
# 2a. Scope check across all 3 worker branches
for b in feat/api feat/ui feat/tests; do
  echo "=== $b ==="; git diff --stat "main...$b"
done

# 2b. Read-only architectural diff audit (exact CLI order: prompt immediately after -p)
(for b in feat/api feat/ui feat/tests; do
  echo "=== $b ==="; git diff "main...$b"
done) | xargs -0 -I{} agy -p \
  "Audit these 3 diffs (inline, no tools) for leaks, bugs, or conflict risks
in 5 short 1-line bullets (<=85 chars) ending with merge readiness: {}" \
  --mode plan
```

Or run both checks in one command with [`scripts/audit-fleet.sh`](./scripts/audit-fleet.sh):

```bash
chmod +x scripts/audit-fleet.sh
./scripts/audit-fleet.sh
```

### 3. Sequential `--no-ff` Merges + Per-Merge Verification

Use `--no-ff` so every worker's merge boundary remains explicit in `git log` for effortless inspection or rollback:

```bash
git merge --no-ff feat/api -m "merge: integrate feat/api"
npm test

git merge --no-ff feat/ui -m "merge: integrate feat/ui"
npm test
```

### 4. Realistic Shared-File `package.json` Conflict & Resolution Workflow

To rehearse a realistic manifest collision on the same line of `package.json`:

```bash
# Add check:api on main
cat <<'EOF' > package.json
{
  "name": "fleet-demo",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test": "node --test",
    "check:api": "node --check src/api.js"
  }
}
EOF
git add package.json && git commit -m "chore(api): add check:api script"

# Add test:verbose on feat/tests inside ../wt-tests
cat <<'EOF' > ../wt-tests/package.json
{
  "name": "fleet-demo",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test": "node --test",
    "test:verbose": "node --test --test-reporter=spec"
  }
}
EOF
git -C ../wt-tests add package.json && git -C ../wt-tests commit -m "chore(tests): add test:verbose script"

# Trigger the controlled conflict pause
git merge --no-ff feat/tests -m "merge: integrate feat/tests"
```

Inspect the paused merge state (never blindly run `git checkout --ours` or `--theirs` on a shared manifest):

```bash
git status -s        # Expect: UU package.json, M  test/app.test.js
cat package.json     # Inspect <<<<<<< HEAD / ======= / >>>>>>> feat/tests
git diff --check     # Flags exact leftover conflict marker line numbers
```

Resolve cleanly with the Integrator agent, then verify independently:

```bash
agy -p \
  'Resolve the Git merge conflict in package.json by keeping BOTH "check:api"
from HEAD and "test:verbose" from feat/tests as valid JSON. Do NOT modify
test/app.test.js or run git add/commit. Run node --check src/api.js and
npm test, then summarize in 3 short lines.' --mode accept-edits

# Independent deterministic verification gates
cat package.json                                  # Confirm valid JSON with all 3 scripts
git diff --check                                  # Expect: blank output, exit 0
git add package.json && git commit --no-edit
npm run check:api && npm run test:verbose         # Expect: 5/5 passing tests
```

### 5. Safe Worktree Teardown Cheatsheet

Once every branch is merged and verified on `main`, remove sibling worktrees, prune stale admin entries, and delete branches using **safe lowercase `-d`** (which refuses deletion if any commit was never merged into `main`):

```bash
git worktree remove ../wt-api
git worktree remove ../wt-ui
git worktree remove ../wt-tests
git worktree prune -v
git branch -d feat/api feat/ui feat/tests
```

Run the final ground-truth verification on `main`:

```bash
git status -s && git worktree list && \
  git log --oneline --graph -n 8 && \
  npm test --silent | grep -E '^# (tests|pass|fail|duration)'
```

Unzoom (`Ctrl-b z`), hop right (`Ctrl-b l`), and refresh `clear && git worktree list` in Pane `2` to confirm only `/workspace/fleet-demo [main]` remains.
