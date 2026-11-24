# Lesson 5.1: The Agent Lifecycle Visualized — Every Hook Point in `hooks.json`

Welcome to Lesson 5.1 of **Advanced Vibe Coding**. This kit includes the zero-dependency `lab-hooks` starter workspace (`package.json`, `tsconfig.json`, `.gitignore`, `src/pricing.js`, `test/pricing.test.js`), the verified 19-line `.agents/hooks.json` lifecycle tracer, the executable 20-line `scripts/hook-logger.py` stdin/stdout JSONL logger, and the complete 6-event lifecycle hook reference.

## Learning Outcomes

1. Map all 6 Antigravity lifecycle hook events (`SessionStart`, `PreInvocation`, `PreToolUse`, `PostToolUse`, `PostInvocation`, `Stop`) and distinguish **flat** handler arrays from **grouped** `{ "matcher", "hooks" }` arrays.
2. Follow the strict camelCase protojson `stdin`/`stdout` hook contract (always emit valid JSON on `stdout`, resolve relative command paths from the directory containing `hooks.json`).
3. Trace real `agy -p "<prompt>" --mode plan` tool calls end-to-end with `jq` and verify matching `toolCallId`, `stepIdx`, and `terminationReason` fields.

## All 6 Lifecycle Hook Events Cheat Sheet

| Event | When It Fires | Matcher Target | JSON Array Structure | Primary Use |
| --- | --- | --- | --- | --- |
| `SessionStart` | Once when a new session boots | N/A (ignored) | **Flat:** `[{ "command": ... }]` | Inject startup repo/branch/TODO context |
| `PreInvocation` | Before each model invocation | N/A (ignored) | **Flat:** `[{ "command": ... }]` | Gate prompts or inject pre-turn system messages |
| `PreToolUse` | Before a matched tool runs | Tool name regex | **Grouped:** `[{ "matcher": "...", "hooks": [...] }]` | `allow`, `deny`, `ask`/`force_ask`, or `overwrite` args |
| `PostToolUse` | After a matched tool finishes | Tool name regex | **Grouped:** `[{ "matcher": "...", "hooks": [...] }]` | Format, lint, typecheck, and log outcomes (returns `{}`) |
| `PostInvocation` | After tool calls complete | N/A (ignored) | **Flat:** `[{ "command": ... }]` | Relay errors via `injectSteps` + `force_continue` |
| `Stop` | When the execution loop ends | N/A (ignored) | **Flat:** `[{ "command": ... }]` | Run final test gates and return `continue` or `allow` |

### Key `hooks.json` & Stdin/Stdout Rules

- **Working directory:** Hook commands execute with the directory containing `hooks.json` as their working directory (so inside `.agents/hooks.json`, use `"../scripts/hook-logger.py"`). Read the repo's working directory from `payload["cwd"]` on `stdin`.
- **CamelCase keys:** All `stdin` fields use camelCase (`conversationId`, `workspacePaths`, `hookEventName`, `cwd`, `toolCall`, `stepIdx`, `terminationReason`, `continuationActive`).
- **Timeouts:** Defaults to `30` s; set explicit short timeouts (e.g., `"timeout": 5`) because hooks run synchronously and block the agent turn.
- **Regex matchers (`PreToolUse` / `PostToolUse`):**
  - `"*"` or `""` — matches every tool
  - `"run_command"` — exact single tool
  - `"(view|read|list|find|grep)_.*|run_command"` — read/search + shell tools
  - `"(write|edit)_file|write_to_file|(multi_)?replace_file_content"` — file edit tools

## Included Files

- [`lab-hooks/`](./lab-hooks/) — Starter workspace (`package.json`, `tsconfig.json` with `checkJs: true`, `.gitignore`, `src/pricing.js`, `test/pricing.test.js` passing `4/4`).
- [`.agents/hooks.json`](./.agents/hooks.json) — Exact 19-line `lifecycle-tracer` hook configuration.
- [`scripts/hook-logger.py`](./scripts/hook-logger.py) — Exact 20-line executable JSONL tracer writing `/tmp/hook-trace.jsonl` and returning `{"decision":"allow"}` on `PreToolUse` (`{}` on all other events).

## Reproducible Hands-On Walkthrough

```bash
# 1. Scaffold /workspace/lab-hooks and install the lifecycle tracer
cp -a lab-hooks /workspace/lab-hooks
mkdir -p /workspace/lab-hooks/.agents /workspace/lab-hooks/scripts
cp .agents/hooks.json /workspace/lab-hooks/.agents/hooks.json
cp scripts/hook-logger.py /workspace/lab-hooks/scripts/hook-logger.py
chmod +x /workspace/lab-hooks/scripts/hook-logger.py

cd /workspace/lab-hooks
git init -b main && git add -A && git commit -m "feat(hooks): init lab-hooks with lifecycle tracer"
npm test                                                                     # expects: pass 4, fail 0
python3 -m json.tool .agents/hooks.json > /dev/null && echo "HOOKS_JSON_OK"

# 2. Local stdin/stdout dry-run before invoking agy
: > /tmp/hook-trace.jsonl
echo '{"hookEventName":"PreToolUse","cwd":"/workspace/lab-hooks","stepIdx":1,"toolCall":{"id":"t1","name":"read_file"}}' \
  | ./scripts/hook-logger.py
cat /tmp/hook-trace.jsonl

# 3. Run live headless agy session and inspect the chronological trace
: > /tmp/hook-trace.jsonl
agy -p "Read package.json and src/pricing.js, then summarize what applyDiscount does in two sentences." --mode plan

# Chronological timeline (SessionStart -> paired PreToolUse/PostToolUse -> Stop)
jq -c '{ev: .hookEventName, tool, step: .stepIdx, id: (.toolCallId // "-"), stop: .terminationReason}' \
  /tmp/hook-trace.jsonl

# Vertical camelCase schema on the Stop event
jq 'select(.hookEventName=="Stop") | {hookEventName, cwd, terminationReason, keys}' \
  /tmp/hook-trace.jsonl
```
