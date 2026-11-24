import test from "node:test";
import assert from "node:assert/strict";
import { loadServiceConfig } from "../src/env-config.js";

test("reads service config from environment object", () => {
  const cfg = loadServiceConfig({ NODE_ENV: "production", SERVICE_API_KEY: "ok" });
  assert.deepEqual(cfg, { envName: "production", hasKey: true });
});

test("defaults envName to development when omitted", () => {
  const cfg = loadServiceConfig({ SERVICE_API_KEY: "ok" });
  assert.deepEqual(cfg, { envName: "development", hasKey: true });
});
