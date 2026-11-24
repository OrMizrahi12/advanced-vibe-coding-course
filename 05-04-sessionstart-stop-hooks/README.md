# Lesson 5.4: `SessionStart`, `PreInvocation` & `Stop` Hooks — Steering the Loop

Welcome to Lesson 5.4 of **Advanced Vibe Coding**. This kit includes the merged 4-hook `.agents/hooks.json` (`lifecycle-tracer` + `safety-gate` + `auto-quality` + `loop-steering`), the executable 19-line `scripts/session-context.py` startup injector, the executable 21-line `scripts/stop-test-gate.py` bounded self-healing gate, the 5-assertion dry-run harness (`scripts/test-loop-steering.sh`), and the loop-steering contract cheat sheet.

## Learning Outcomes

1. Inject live Git branch, dirty file status, and open `TODO.md` tasks once at startup via `SessionStart` (`injectSteps`) so the agent starts informed with **zero** wasted read/shell tool calls.
2. Enforce a deterministic `Stop` test gate that forces continuation (`{"decision": "continue", "reason": "..."}`) when `npm test` fails after a normal `NO_TOOL_CALL` turn.
3. Prevent infinite retry loops mechanically by gating on `terminationReason == "NO_TOOL_CALL"`, tracking `continuationActive`, and capping retries per `conversationId` (`CAP = 2`).

## `SessionStart` vs. `PreInvocation` vs. `Stop` Contract Cheat Sheet

All three events use **flat** handler arrays (no `matcher` wrapper) inside `.agents/hooks.json`:

| Event | Fires When | Key `stdin` Fields | `stdout` Control Contract |
| --- | --- | --- | --- |
| `SessionStart` | Once per new session | `conversationId`, `cwd`, `workspacePaths`, `modelName` | `{"injectSteps": [{"systemMessage": {"systemMessage": "..."}}]}` |
| `PreInvocation` | Before every model call | `invocationNum`, `initialNumSteps`, `lastUserInput`, `cwd` | `{"injectSteps": [...], "terminationBehavior": "" \| "terminate"}` (pair `"terminate"` with `{"errorMessage": {"userMessage": "..."}}` to block a turn cleanly) |
| `Stop` | When the agent loop tries to exit | `terminationReason`, `continuationActive`, `executionNum`, `fullyIdle`, `cwd` | `{"decision": "continue", "reason": "..."}` to re-enter loop, or `{"decision": "allow"}` to stop |

### Nested `injectSteps` Schema Note

- Always nest `systemMessage` as an object inside `injectSteps`:
  ```json
  {
    "injectSteps": [
      {
        "systemMessage": {
          "systemMessage": "Live repo context: branch=main"
        }
      }
    ]
  }
  ```
- Passing a bare string (`{"systemMessage": "..."}`) violates the protojson contract.

### Mandatory Loop-Safety Rules for `Stop` Hooks

1. **Respect non-normal stops:** Only gate `terminationReason == "NO_TOOL_CALL"`. Immediately return `{"decision": "allow"}` for `USER_CANCELED`, `ERROR`, `MAX_INVOCATIONS`, or `MAX_TOKEN_BUDGET_EXCEEDED`.
2. **Track `continuationActive` (with `executionNum` fallback):** Reset the per-`conversationId` retry counter to `0` when both `continuationActive` and `executionNum` are falsy (fresh user turn); increment when either indicates a `Stop`-forced continuation (`bool(p.get("continuationActive") or p.get("executionNum"))`).
3. **Enforce a hard retry cap (`CAP = 2`):** Once `cont and retries >= CAP`, reset and return `{"decision": "allow"}` so an unfixable failure never burns infinite tokens.
4. **Leave timeout headroom:** Give `Stop` `"timeout": 15` in `hooks.json` when running `npm test` with Python `timeout=12` so valid JSON always flushes before timeout.

## Included Files

- [`.agents/hooks.json`](./.agents/hooks.json) — Merged 4-hook config (`lifecycle-tracer`, `safety-gate`, `auto-quality`, `loop-steering`).
- [`scripts/session-context.py`](./scripts/session-context.py) — Exact 19-line executable `SessionStart` injector.
- [`scripts/stop-test-gate.py`](./scripts/stop-test-gate.py) — Exact 21-line executable bounded `Stop` test gate (`CAP = 2`).
- [`scripts/test-loop-steering.sh`](./scripts/test-loop-steering.sh) — Sandboxed 5-assertion dry-run harness verifying `SessionStart` + all 4 `Stop` safety paths (`skip`, `retry 1`, `retry 2`, `cap_reached`).

## Reproducible Hands-On Walkthrough

> **Prerequisite:** Start from `/workspace/lab-hooks` cleanly committed on `main` (from Lesson 5.3, `pass 5, fail 0`).

```bash
# 1. Run standalone dry-run tests for SessionStart + all 4 Stop safety paths
./scripts/test-loop-steering.sh

# 2. Install merged hooks and scripts into /workspace/lab-hooks
cp .agents/hooks.json /workspace/lab-hooks/.agents/hooks.json
cp scripts/session-context.py scripts/stop-test-gate.py /workspace/lab-hooks/scripts/
chmod +x /workspace/lab-hooks/scripts/session-context.py /workspace/lab-hooks/scripts/stop-test-gate.py

cd /workspace/lab-hooks
python3 -m json.tool .agents/hooks.json > /dev/null && echo "HOOKS_JSON_OK"

# 3. Create TODO.md and prove zero-tool-call SessionStart context in agy
cat <<'EOF' > TODO.md
# Lab Hooks Tasks
- [x] Wire PreToolUse safety gate
- [x] Wire PostToolUse auto-quality loop
- [ ] Add calcTax(cents, ratePct) with rounding + unit test
EOF

: > /tmp/session-context.jsonl && : > /tmp/hook-trace.jsonl
agy -p "Without running any shell commands or reading any files, report our current git branch, dirty files, and open TODO.md item from your session context." \
  --mode plan

# Confirm 0 PreToolUse/PostToolUse calls were needed!
jq -c '{ev: .hookEventName, tool, stop: .terminationReason}' /tmp/hook-trace.jsonl

# 4. Plant a typed logic bug (Math.floor in calcTax) and watch Stop self-heal it live
: > /tmp/stop-gate.jsonl && : > /tmp/stop-retries.json
agy -p "Add a one-line JSDoc description to calcTax in src/pricing.js, then finish right away without running npm test unless a hook reports a test failure; if a hook reports a test failure, fix the bug in src/pricing.js and mark the calcTax item done in TODO.md." \
  --mode accept-edits

# Inspect triple-log forensics: Stop #1 fail/continue -> Stop #2 pass/allow
jq -c '.' /tmp/stop-gate.jsonl
npm run typecheck && npm test
```
