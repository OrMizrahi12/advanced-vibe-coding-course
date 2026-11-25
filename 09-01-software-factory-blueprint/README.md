# Lesson 9.1: Designing the Software Factory Blueprint (Prompt → Live Production)

Welcome to Lesson 9.1 of **Advanced Vibe Coding**. This starter kit defines the five-stage Software Factory blueprint (`BLUEPRINT.md`), the single-paragraph ShipPulse product brief (`SHIPPULSE-PROMPT.md`), the machine-checked 3-lane / 10-gate JSON contract (`contracts/factory-contract.json`), and the zero-dependency prefix-overlap validator (`scripts/validate-blueprint.mjs`).

## Five-Stage Software Factory Pipeline

| Stage | Artifact / Command | Responsibility |
| --- | --- | --- |
| **1. Spec** | `/factory-spec` | Compiles a one-paragraph prompt into `SPEC.md`, SQL + `auth.uid()` RLS contracts, and disjoint lane `.ralph/PRD.json` backlogs |
| **2. Provision** | `factory.sh` | Spawns 3 isolated `git worktree` lanes (`db-api`, `ui-board`, `auth-e2e`), symlinks `node_modules`, and seeds gitignored `.ralph/` state |
| **3. Build** | `ralph-loops` | Runs hardened `ralph.sh` loops (`npm run verify`, Playwright UI gate, root `hooks.json` guards) and merges 3/3 lanes cleanly to `main` |
| **4. Audit** | `/factory-audit` | Verifies Postgres `auth.uid()` RLS isolation, read-only Supabase Security Advisors, secret hygiene, and GitHub Actions CI |
| **5. Ship** | `/factory-ship` | Pushes migrations (`supabase db push --remote`), syncs `vercel env`, opens a CI-gated PR, deploys `vercel --prod`, and runs a live smoke test |

## Included Files

- [`.gitignore`](./.gitignore) — Symlink-safe `node_modules` (no trailing slash), `*.log`, `logs/`, `.ralph/`, `.env*`.
- [`SHIPPULSE-PROMPT.md`](./SHIPPULSE-PROMPT.md) — Exact 15-line ShipPulse product prompt targeting the `$0` free-tier stack (`shippulse-dev`).
- [`BLUEPRINT.md`](./BLUEPRINT.md) — Exact 19-line five-stage Software Factory blueprint.
- [`contracts/factory-contract.json`](./contracts/factory-contract.json) — Exact 20-line machine-checked contract targeting `.agents/plugins/software-factory/hooks.json` and 3 disjoint worktree lanes.
- [`scripts/validate-blueprint.mjs`](./scripts/validate-blueprint.mjs) — Exact 20-line zero-dependency ESM validator enforcing stage order, root `hooks.json`, `shippulse-dev` slot reuse, `.ralph/` scoping, prefix-overlap checks, and 5+5 verification/release gates.

## Running Positive & Negative Validator Checks

```bash
# 1. Verify clean blueprint passes (exit 0)
node scripts/validate-blueprint.mjs
# Expect: BLUEPRINT_OK stages=5 lanes=3 overlaps=0 gates=5+5 db=shippulse-dev

# 2. Prove nested path overlap & misplaced hooks.json fail loudly (exit 1)
jq '.lanes["ui-board"].owns += ["src/app/"] | .hooksPath = "hooks/hooks.json"' \
  contracts/factory-contract.json > /tmp/bad-contract.json
node scripts/validate-blueprint.mjs /tmp/bad-contract.json; echo "exit=$?"
rm -f /tmp/bad-contract.json

# 3. Inspect the 3 disjoint lane ownership boundaries
jq -r '.lanes | to_entries[] | "\(.key)\t\(.value.branch)\t\(.value.owns | join(", "))"' \
  contracts/factory-contract.json | awk -F'\t' '{printf "%-9s %-14s %s\n", $1, $2, $3}'
```

## Read-Only `agy -p` Architecture Dry-Check

> **CLI flag order note:** Always pass the prompt string immediately after `-p`, followed by `--mode plan --output-format json`.

```bash
agy -p "Read SHIPPULSE-PROMPT.md and contracts/factory-contract.json. Verify ShipPulse Postgres tables (features, votes, changelogs), auth.uid() RLS, UI board/changelog routes, and Auth/Playwright checks map cleanly onto db-api, ui-board, and auth-e2e with zero overlaps, shippulse-dev reuse, and zero secrets. Reply in 6 short plain-text lines (max 80 chars each)." \
  --mode plan --output-format json | jq -r '.response'
```

## Adapting `factory-contract.json` to Your Own SaaS Prompt

1. Replace `SHIPPULSE-PROMPT.md` with your own single-paragraph product specification.
2. Keep `hooksPath: "hooks.json"` at the plugin root and keep every lane's `owns` prefixes strictly disjoint (no lane may own a parent directory of another lane's path).
3. Run `node scripts/validate-blueprint.mjs` after every edit to prove `overlaps=0` before provisioning worktrees.
