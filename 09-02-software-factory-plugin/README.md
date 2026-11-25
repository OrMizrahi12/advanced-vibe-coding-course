# Lesson 9.2: Assembling the Reusable `software-factory` Plugin & `factory.sh` Orchestrator

Welcome to Lesson 9.2 of **Advanced Vibe Coding**. This starter kit packages a complete, portable Antigravity CLI plugin (`.agents/plugins/software-factory/`) with root-level `hooks.json`, four executable Python lifecycle hooks, four chained workflow skills (`/factory-spec`, `/factory-build`, `/factory-audit`, `/factory-ship`), parameterized read-only Supabase Remote MCP config, a deterministic bundle validator (`scripts/validate-factory.mjs`), and the 59-line `factory.sh` orchestrator with `--dry-run`.

## Drop-In Installation for Any Repository

```bash
cp -a .agents scripts/validate-factory.mjs factory.sh /path/to/your-repo/
chmod +x /path/to/your-repo/factory.sh \
         /path/to/your-repo/.agents/plugins/software-factory/hooks/*.py
```

> Keep `hooks.json` strictly at `.agents/plugins/software-factory/hooks.json` (never nested inside `hooks/hooks.json` or floating at `.agents/hooks.json`).

## Included Files (15 Total)

- [`.agents/plugins/software-factory/plugin.json`](./.agents/plugins/software-factory/plugin.json) — 12-line plugin manifest.
- [`.agents/plugins/software-factory/rules/AGENTS.md`](./.agents/plugins/software-factory/rules/AGENTS.md) — 8-line plugin rules with `SOFTWARE_FACTORY_PLUGIN` confirmation marker.
- Four 15-line chained skills: `factory-spec`, `factory-build`, `factory-audit`, `factory-ship`.
- [`.agents/plugins/software-factory/hooks.json`](./.agents/plugins/software-factory/hooks.json) — 18-line root hooks registry (`PreToolUse`, `PostToolUse`, `SessionStart`, `Stop`).
- Four executable Python hooks (`0755`): `pretool-safety.py`, `posttool-quality.py`, `session-context.py`, `stop-guard.py`.
- [`.agents/plugins/software-factory/mcp_config.json`](./.agents/plugins/software-factory/mcp_config.json) — 7-line parameterized read-only Supabase Remote HTTP MCP config (`${SUPABASE_PROJECT_REF}`, zero hardcoded secrets).
- [`scripts/validate-factory.mjs`](./scripts/validate-factory.mjs) — 22-line deterministic bundle validator.
- [`factory.sh`](./factory.sh) — 59-line executable orchestrator with `--dry-run`, worktree provisioning, `node_modules` symlinking, and 2×2 `tmux` dispatch.

## Verifying Hooks, Bundle Integrity, `--dry-run` & Live `agy` Discovery

### 1. Test `PreToolUse`, `SessionStart` & `Stop` Hooks Directly via `stdin`

```bash
for p in \
  '{"toolCall":{"name":"view_file","args":{"AbsolutePath":"/workspace/shippulse/.env"}}}' \
  '{"toolCall":{"name":"run_command","args":{"CommandLine":"rm -rf src"}}}' \
  '{"toolCall":{"name":"run_command","args":{"CommandLine":"git push --force origin main"}}}' \
  '{"toolCall":{"name":"run_command","args":{"CommandLine":"npm run verify"}}}'; do
  printf '%s\n' "$p" | .agents/plugins/software-factory/hooks/pretool-safety.py
done

printf '{"hookEventName":"SessionStart","cwd":"."}\n' \
  | .agents/plugins/software-factory/hooks/session-context.py
printf '{"conversationId":"c1","cwd":".","terminationReason":"NO_TOOL_CALL","continuationActive":false}\n' \
  | .agents/plugins/software-factory/hooks/stop-guard.py
```

### 2. Run Positive & Negative `validate-factory.mjs` Checks + `./factory.sh --dry-run`

```bash
node scripts/validate-factory.mjs
# Expect: FACTORY_PLUGIN_OK skills=4 hooks=root mcp=read_only factory=valid

# Negative check proving misplaced hooks.json & unsafe MCP fail loudly (exit 1)
cp -a .agents/plugins/software-factory /tmp/bad-plugin
mv /tmp/bad-plugin/hooks.json /tmp/bad-plugin/hooks/hooks.json
sed -i 's/read_only=true/read_only=false\&token=secret_demo/' /tmp/bad-plugin/mcp_config.json
node scripts/validate-factory.mjs /tmp/bad-plugin; echo "exit=$?"
rm -rf /tmp/bad-plugin

# Non-mutating pre-flight dry-run (0 worktrees created, 0 tmux sessions started)
./factory.sh --dry-run
```

### 3. Live Read-Only `agy -p` Plugin Discovery Check

> **CLI flag order note:** Always pass the prompt string immediately after `-p`, followed by `--mode plan --output-format json`.

```bash
agy -p "Without running shell commands or editing files, confirm active factory tooling with the exact marker from software-factory rules/AGENTS.md and list all four discovered factory-* skills in 5 short plain-text lines (max 80 chars each)." \
  --mode plan --output-format json | jq -r '.response'
```
