# Lesson 9.3: Live Factory Run (Part 1) — One Prompt → Spec, Parallel Agents & Verified Code

Welcome to Lesson 9.3 of **Advanced Vibe Coding**. This starter kit contains the complete, runnable **ShipPulse** build assembled across three parallel worktree lanes (`db-api`, `ui-board`, `auth-e2e`), its Postgres RLS migration (`supabase/migrations/001_shippulse.sql`), zero-conflict shared contract (`src/shared/types.ts` + `src/server.ts`), Playwright E2E gate (`scripts/e2e-shippulse.mjs`), and the complete `factory.sh` + `ralph.sh` + `scripts/fleet-board.sh` orchestration harness.

## Step-by-Step Live Factory Reproduction Guide

### 1. Bootstrap a Fresh Repo With the Lesson 9.2 Plugin & Lean Dev Dependencies

```bash
cp -a ../09-02-software-factory-plugin/student-kit/.agents .
chmod +x factory.sh ralph.sh scripts/verify.sh scripts/fleet-board.sh \
         .agents/plugins/software-factory/hooks/*.py

npm install -D typescript @types/node playwright-core
node scripts/validate-blueprint.mjs && node scripts/validate-factory.mjs
```

### 2. Compile Stage 1 Spec, RLS SQL & Disjoint Backlog With `/factory-spec`

> **CLI flag order note:** Always pass the prompt string immediately after `-p`, followed by `--mode accept-edits --output-format json`.

```bash
agy -p "/factory-spec Read SHIPPULSE-PROMPT.md, contracts/factory-contract.json, and src/shared/types.ts. Compile SPEC.md, supabase/migrations/001_shippulse.sql (public.features, public.votes with UNIQUE(feature_id,user_id), public.changelogs, ENABLE ROW LEVEL SECURITY + auth.uid() policies), and backlogs/fleet.json (db-api, ui-board, auth-e2e with 2 stories each) respecting disjoint lane ownership. Run node scripts/validate-blueprint.mjs and reply in 4 compact lines." \
  --mode accept-edits --output-format json | jq -r '.response'

node scripts/validate-blueprint.mjs
```

### 3. Dry-Run, Launch the 3-Lane Parallel `tmux` Fleet & Zoom Pane 4

```bash
# Non-mutating dry run (0 worktrees created, 0 tmux sessions started)
./factory.sh --dry-run

# Launch 3 parallel worktrees + 2x2 tmux fleet (Panes 1-3 Ralph loops, Pane 4 live HUD)
./factory.sh && git worktree list
tmux attach -t shippulse-factory
```

- Wait for Pane 4 HUD to reach `FLEET: 3/3 done | 6/6 stories | READY`.
- Press **`Ctrl-b z`** inside Pane 4 to zoom full-width for audits, merges, and clean teardown.

### 4. Verify Disjoint File Ownership, Merge With Zero Conflicts & Teardown Cleanly

```bash
for b in feat/db-api feat/ui-board feat/auth-e2e; do
  echo "$b: $(git diff --name-only "main...$b" | tr '\n' ' ')"
done

for b in feat/db-api feat/ui-board feat/auth-e2e; do
  git merge --no-ff -m "merge: integrate $b" "$b"
done

for l in db-api ui-board auth-e2e; do
  git worktree remove "../wt-$l"
done
git worktree prune && git branch -d feat/db-api feat/ui-board feat/auth-e2e
```

### 5. Run Full-Stack Verification (`tsc` + `lint` + `unit` + Headless Playwright E2E)

```bash
npm run -s verify
npm run -s e2e
# Expect: {"ok":true,"modules":["db-api","ui-board","auth-e2e"],"upvote":"42->43->42","errs":0}
```
