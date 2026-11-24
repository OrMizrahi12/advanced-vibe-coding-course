# Lesson 6.1: Model Context Protocol (MCP) Under the Hood — Stdio vs. Streamable HTTP

Welcome to Lesson 6.1 of **Advanced Vibe Coding**. This starter kit contains a zero-dependency 42-line Stdio MCP JSON-RPC 2.0 server (`scripts/project-mcp.mjs`), its 3-test Node verification suite (`test/mcp.test.mjs`), sample release data (`data/releases.json`), trimmed `.agents/mcp_config.json` with `disabledTools`, an `enabledTools` allowlist alternative, and exact wire-probe & token-budget commands.

## Stdio vs. Streamable HTTP Transport

| Transport | Config Key | Process Model | Best Used For |
| --- | --- | --- | --- |
| **Stdio** | `"command"` + `"args"` + `"env"` | Local child process speaking line-delimited JSON-RPC 2.0 over `stdin`/`stdout` (logs go strictly to `stderr` or a file, never `stdout`) | Local project tools, filesystem/data bridges, zero-network internal helpers |
| **Streamable HTTP** | `"url"` (or legacy `"serverUrl"`) | Remote HTTPS endpoint with OAuth 2.1 dynamic client registration and single-endpoint streaming | Managed cloud infrastructure (`https://mcp.supabase.com/mcp`) |
| **Legacy SSE Bridge** | `"command": "npx"`, `"args": ["-y", "mcp-remote", "<sse-url>"]` | Wraps older two-endpoint SSE MCP servers behind a local Stdio bridge | Legacy servers that have not migrated to Streamable HTTP yet |

## Tool Budget Controls (`disabled`, `disabledTools`, `enabledTools`)

- **`"disabled": true`:** Keeps a remote server configured without connecting or injecting any of its schemas into the agent prompt.
- **`"disabledTools": [...]`:** Denylists unused admin tools so their JSON schemas never consume Turn 1 input tokens (cutting `project-pulse` from `11` tools / `7,628` chars / `~1,907` est. tokens down to `1` tool / `210` chars / `~52` est. tokens — a `97%` schema cut).
- **`"enabledTools": [...]`:** Strict allowlist alternative (see [`examples/mcp_config-allowlist.json`](./examples/mcp_config-allowlist.json)) for global `~/.gemini/config/mcp_config.json` or high-surface servers.

## MCP vs. Native CLI Decision Matrix

| Capability | Prefer Native CLI (`gh`, `vercel`, `supabase`, `git`) | Prefer MCP Server |
| --- | --- | --- |
| Startup token cost | `0` startup tokens (invoked via shell only when needed) | Every enabled tool schema loads on Turn 1 |
| Stateful OAuth / structured DB introspection | Requires local auth tokens or custom scripts | Built-in OAuth 2.1 + typed read-only inspection (`list_tables`, `get_advisors`) |
| Rule of thumb | Default to lean native CLIs whenever a mature CLI exists | Reach for MCP when you need scoped OAuth or typed stateful schemas, and trim unused tools aggressively |

## Included Files

- [`package.json`](./package.json) — Zero-dependency ESM package running `node --test`.
- [`data/releases.json`](./data/releases.json) — 8-line sample release ledger (`v1.5.0` blocked by missing RLS policy).
- [`scripts/project-mcp.mjs`](./scripts/project-mcp.mjs) — Exact 42-line zero-dependency Stdio MCP server (`protocolVersion: "2025-03-26"`, `initialize`, `ping`, `tools/list`, `tools/call`, `-32601`).
- [`test/mcp.test.mjs`](./test/mcp.test.mjs) — 35-line `node:test` child-process suite (`pass 3, fail 0`).
- [`.agents/mcp_config.json`](./.agents/mcp_config.json) — 21-line Stdio (`project-pulse` with `disabledTools`) + Streamable HTTP (`supabase` paused with `"disabled": true`).
- [`examples/mcp_config-allowlist.json`](./examples/mcp_config-allowlist.json) — `enabledTools` allowlist template (usable in workspace `.agents/mcp_config.json` or global `~/.gemini/config/mcp_config.json`).

## Reproducible Verification Commands

### 1. Run Unit Tests & Inspect the Raw JSON-RPC 2.0 Wire Protocol

```bash
chmod +x scripts/project-mcp.mjs
npm test

printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}\n{"jsonrpc":"2.0","method":"notifications/initialized"}\n{"jsonrpc":"2.0","id":2,"method":"tools/list"}\n{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"release_status","arguments":{"version":"v1.5.0"}}}\n' \
  | MCP_LOG=/tmp/mcp-wire.log node scripts/project-mcp.mjs \
  | jq -c 'if .id==1 then {id,ver:.result.protocolVersion} elif .id==2 then {id,tools:(.result.tools|length)} else (.result.content[0].text|fromjson)|{id:3,v:.version,status,blocker} end'
```

### 2. Audit `tools/list` Schema Bytes & Estimated Tokens

```bash
printf '{"jsonrpc":"2.0","id":1,"method":"tools/list"}\n' \
  | MCP_LOG=/tmp/mcp-wire.log node scripts/project-mcp.mjs \
  | jq -c '{all_11_chars: (.result.tools|tojson|length), all_11_est_tok: ((.result.tools|tojson|length)/4|floor), one_tool_chars: ([.result.tools[0]]|tojson|length), one_tool_est_tok: (([.result.tools[0]]|tojson|length)/4|floor)}'
```

### 3. Measure Live `input_tokens` Before vs. After `disabledTools`

> **CLI flag & caching notes:** Pass the prompt string immediately after `-p`, followed by `--mode plan --effort low`, a least-privilege `--settings` allow-rule for `mcp(project-pulse/*)` (headless `-p` auto-denies unapproved MCP calls), and `--output-format stream-json` so `jq` reads exact Turn-1 prompt tokens (`input_tokens + cache_read_tokens` on `step_index == 1`, immune to prompt-cache skew and multi-step thinking variance). Update the absolute paths in `.agents/mcp_config.json` if your checkout directory differs from `/workspace/lab-mcp`.

```bash
# Run once BEFORE adding disabledTools -> /tmp/mcp-all.json,
# then run the exact same prompt AFTER adding disabledTools -> /tmp/mcp-lean.json:
agy -p "Using ONLY project-pulse MCP tools (no shell commands or file reads), check release v1.5.0 and reply in one short line with its status and blocker." \
  --mode plan --effort low \
  --settings '{"permissions":{"allow":["mcp(project-pulse/*)"]}}' \
  --output-format stream-json \
  | jq -sc '{status: (map(select(.event=="result"))[0].result.status), response: (map(select(.event=="result"))[0].result.response), in_tok: (map(select(.step_update.step_index==1))[0].step_update.usage | .input_tokens + (.cache_read_tokens // 0)), total_in: (map(select(.event=="result"))[0].result.usage | .input_tokens + (.cache_read_tokens // 0))}' > /tmp/mcp-lean.json

# Compare Turn-1 prompt input tokens side by side
jq -s '[{run:"all-11-tools", in_tok:.[0].in_tok, total_in:.[0].total_in},
        {run:"lean-1-tool",  in_tok:.[1].in_tok, total_in:.[1].total_in},
        {saved_input_tokens:(.[0].in_tok - .[1].in_tok)}]' /tmp/mcp-all.json /tmp/mcp-lean.json
```
