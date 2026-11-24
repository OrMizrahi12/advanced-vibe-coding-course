#!/usr/bin/env node
import { appendFileSync, readFileSync } from "node:fs";
import { createInterface } from "node:readline";
const DATA = process.env.MCP_DATA || "data/releases.json";
const LOG = process.env.MCP_LOG || "/tmp/mcp-wire.log";
const log = (m) => appendFileSync(LOG, `${new Date().toISOString()} ${m}\n`);
const write = (o) => process.stdout.write(JSON.stringify(o) + "\n");
const send = (id, result) => write({ jsonrpc: "2.0", id, result });
const f = (d, type = "string") => ({ type, description: d });
const PROPS = {
  env: f("Target cluster environment: dev, staging, or production."),
  region: f("Cloud deployment region slug, e.g. us-east-1 or eu-west-1."),
  window: f("ISO-8601 time window range for audit query or replay."),
  filter: f("Structured key=value predicate expression for filtering."),
  format: f("Output format: json, ndjson, csv, or markdown summary."),
  limit: f("Maximum records returned per paginated page (1-500).", "integer") };
const EXTRA = ["audit_logs", "billing_export", "cache_purge", "db_snapshot",
  "deploy_preview", "env_diff", "incident_page", "metrics_dump",
  "quota_report", "webhook_replay"].map((name) => ({ name,
    description: `Admin ${name}: cross-region export, filter & cursor replay.`,
    inputSchema: { type: "object", properties: PROPS } }));
const TOOLS = [{ name: "release_status",
  description: "Return release status, owner, env, and blocker by version.",
  inputSchema: { type: "object", properties: { version: f("Semver like v1.5") } }
}, ...EXTRA];
createInterface({ input: process.stdin }).on("line", (raw) => {
  if (!raw.trim()) return;
  const { id, method, params = {} } = JSON.parse(raw);
  log(`${method}${params.name ? ":" + params.name : ""}`);
  if (id === undefined) return;
  if (method === "initialize") return send(id, { capabilities: { tools: {} },
    protocolVersion: params.protocolVersion || "2025-03-26",
    serverInfo: { name: "project-pulse", version: "1.0.0" } });
  if (method === "ping") return send(id, {});
  if (method === "tools/list") return send(id, { tools: TOOLS });
  if (method === "tools/call") {
    const rows = JSON.parse(readFileSync(DATA, "utf8"));
    const v = params.arguments?.version;
    const out = params.name !== "release_status" ? { tool: params.name, ok: true }
      : (v ? rows.find((r) => r.version === v) || { error: "not_found" } : rows);
    return send(id, { content: [{ type: "text", text: JSON.stringify(out) }] }); }
  write({ jsonrpc: "2.0", id, error: { code: -32601, message: method } }); });
