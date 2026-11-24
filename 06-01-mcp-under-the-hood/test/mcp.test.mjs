import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

function rpc(msgs) {
  const input = msgs.map((m) => JSON.stringify(m)).join("\n") + "\n";
  const r = spawnSync("node", ["scripts/project-mcp.mjs"], {
    input, encoding: "utf8", env: { ...process.env, MCP_LOG: "/tmp/mcp-test.log" }
  });
  assert.equal(r.status, 0);
  return r.stdout.trim().split("\n").map((l) => JSON.parse(l));
}

test("initialize and tools/list return MCP 2025-03-26 catalog", () => {
  const [init, list] = rpc([
    { jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
    { jsonrpc: "2.0", method: "notifications/initialized" },
    { jsonrpc: "2.0", id: 2, method: "tools/list" }
  ]);
  assert.equal(init.result.protocolVersion, "2025-03-26");
  assert.equal(list.result.tools.length, 11);
});

test("tools/call release_status returns v1.5.0 blocker", () => {
  const [call] = rpc([{ jsonrpc: "2.0", id: 3, method: "tools/call",
    params: { name: "release_status", arguments: { version: "v1.5.0" } } }]);
  const row = JSON.parse(call.result.content[0].text);
  assert.equal(row.status, "blocked");
  assert.match(row.blocker, /RLS policy/);
});

test("unknown method returns JSON-RPC -32601 error", () => {
  const [err] = rpc([{ jsonrpc: "2.0", id: 4, method: "nope/ping" }]);
  assert.equal(err.error.code, -32601);
});
