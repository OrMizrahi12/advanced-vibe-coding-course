# Lesson 3.5: Custom Subagents — Isolating Heavy Research, Reviews & Audits

Welcome to Lesson 3.5 of **Advanced Vibe Coding**. This kit includes both verified read-only custom subagent definitions (`.agents/agents/security-auditor/agent.md` and `.agents/agents/codebase-researcher/agent.md`), the vulnerable draft promo modules so you can reproduce the parallel security audit live, the hardened reference patch with unit tests, and the `agent.md` + `/agents` command cheat sheet.

## Learning Outcomes

1. Quarantine heavy file reads, grep sweeps, and audits inside isolated child context windows so your main coordinator receives compact summaries instead of raw dumps.
2. Author `.agents/agents/<name>/agent.md` definitions with explicit model tiers (`pro` vs. `flash`), verified built-in read-only tool allowlists (`view_file`, `grep_search`, `find_by_name`, `list_dir`), and quoted `commandExecutionPolicy: "off"`.
3. Verify read-only enforcement mechanically with `git status -s && git diff`, inspect private child tool calls in the `/agents` Subagent Detail View, and remediate cleanly from a fresh main thread.

## Core Vocabulary

| Term | Definition |
| --- | --- |
| **Context isolation** | Running heavy exploration or auditing in a separate child window so tens of thousands of raw read/grep tokens stay out of your main thread. |
| **Tool allowlist** | The YAML `tools:` list in `agent.md` naming the exact built-in tools a subagent may invoke (omitting write and shell tools locks mutations off). |
| **Read-only subagent** | A custom subagent pairing a read-only `tools:` allowlist with `commandExecutionPolicy: "off"` so it cannot modify files or execute shell commands. |

## `agent.md` YAML Frontmatter Cheat Sheet

Place each custom subagent at `.agents/agents/<name>/agent.md` (workspace-scoped) or `~/.gemini/config/agents/<name>/agent.md` (global):

| Field | Example | Notes |
| --- | --- | --- |
| `name` | `security-auditor` | Lowercase hyphenated agent identifier matching folder name |
| `description` | `Read-only security auditor...` | Tells the coordinator when to delegate to this subagent |
| `subagent` | `true` | Allows parent agents to invoke this agent as a child |
| `mainAgent` | `true` | Allows selecting this agent as a top-level session in `/agents` |
| `model` | `pro` / `flash` / `inherit` | Pick deeper reasoning (`pro`) for audits and fast mapping (`flash`) for search |
| `commandExecutionPolicy` | `"off"` | **Always quote `"off"`** so YAML does not parse bare `off` as boolean `false` |
| `tools` | `[view_file, grep_search, ...]` | Exact built-in tool names only (misspelled names can stall execution!) |

### Verified Built-In Read-Only Tool Names

- `view_file` *(Note: use `view_file`, NOT `read_file`!)*
- `grep_search`
- `find_by_name`
- `list_dir`

Omit `write_to_file`, `replace_file_content`, `multi_replace_file_content`, and `run_command` to enforce a strict read-only lock.

### `commandExecutionPolicy` Reference

| Value | Behavior | Best For |
| --- | --- | --- |
| `"off"` | Disables shell command execution completely | Strict read-only auditors and codebase mappers |
| `"sandbox"` | Runs shell commands inside restricted sandbox boundaries | Untrusted test or build checks |
| `"auto"` | Standard approval-gated command execution | General coding subagents |
| `"eager"` | Auto-executes commands without interactive confirmation | Controlled autonomous loops in isolated worktrees |

### `/agents` Panel Keybindings

| Key | Action |
| --- | --- |
| `Enter` | Expand subagent group or open **Subagent Detail View** |
| `K` | Kill / stop a running subagent |
| `Esc` | Close Detail View or return to coordinator prompt |
| `Alt+J` | Cycle / jump between active agent panes |
| `Ctrl+K` | Open quick command / agent actions |

## Section 3 Context Engineering Summary

1. **Lesson 3.1 (Context Rot):** Subtract noise first — feed the smallest high-signal token set.
2. **Lesson 3.2 (Hierarchical Rules):** Keep root `AGENTS.md` razor-thin (<24 KB/file, <20k tokens aggregate) and scope domain rules locally.
3. **Lesson 3.3 (Progressive Disclosure):** Store deep runbooks in `docs/` and load them on demand.
4. **Lesson 3.4 (Session Hygiene):** Use `/fork` + `/resume`, `/rewind`, `/compact`, and `HANDOFF.md` + `/exit` to keep threads rot-free.
5. **Lesson 3.5 (Custom Subagents):** Quarantine heavy exploration and audits inside read-only child windows returning compact tables and `file:line` pointers.

## Included Files

- [`.agents/agents/security-auditor/agent.md`](./.agents/agents/security-auditor/agent.md) — Exact 22-line `model: pro` read-only security auditor.
- [`.agents/agents/codebase-researcher/agent.md`](./.agents/agents/codebase-researcher/agent.md) — Exact 22-line `model: flash` read-only codebase mapper.
- [`vulnerable-lab/backend/promo-evaluator.js`](./vulnerable-lab/backend/promo-evaluator.js) — Draft backend module containing `new Function` injection (line 9) and dynamic `new RegExp` ReDoS/throw (line 17).
- [`vulnerable-lab/frontend/promo-preview.js`](./vulnerable-lab/frontend/promo-preview.js) — Draft frontend module containing unescaped HTML XSS (lines 6–9).
- [`hardened-solution/`](./hardened-solution/) — Verified remediated `backend/promo-evaluator.js`, `frontend/promo-preview.js`, and `test/promo.test.js` (`npm test` green).

## Reproducible Hands-On Walkthrough

### 1. Verify the Hardened Reference Solution Standalone

```bash
cd hardened-solution
npm test && node --check backend/promo-evaluator.js frontend/promo-preview.js
```

### 2. Reproduce the Parallel Read-Only Audit in `/workspace/lab-context`

```bash
mkdir -p /workspace/lab-context/.agents
cp -r .agents/agents /workspace/lab-context/.agents/
cp vulnerable-lab/backend/promo-evaluator.js /workspace/lab-context/backend/
cp vulnerable-lab/frontend/promo-preview.js /workspace/lab-context/frontend/

cd /workspace/lab-context
git add .agents/ backend/promo-evaluator.js frontend/promo-preview.js
git commit -m "Add custom read-only subagents and draft promo modules"
agy --mode accept-edits
```

Inside `agy`:
1. Type `/agents` and verify both `codebase-researcher` and `security-auditor` appear under **Available Agents**, then press `Esc`.
2. Dispatch both read-only subagents in parallel and ask `security-auditor` to try editing files and running `npm test` — confirm it refuses both actions.
3. Run `! git status -s && git diff` — confirm **completely blank output** (zero mutations on disk).
4. Open `/agents` → the completed `(2 done)` group → `security-auditor` to inspect `Tools: Read, SendMessage` and private `Read(...)` steps quarantined inside the child window.
5. Patch all 3 findings cleanly from the main thread and verify `! npm test` (`pass 16, fail 0`).

### 3. Headless Sanity Check (Optional)

```bash
agy -p "List all custom agents configured under .agents/agents/ along with their model and commandExecutionPolicy." --mode plan
```
