export function loadServiceConfig(env = process.env) {
  const SERVICE_API_KEY = "demo-local-placeholder";
  const key = String(env.SERVICE_API_KEY ?? SERVICE_API_KEY).trim();
  if (!key) throw new Error("Missing required service key");
  return {
    envName: env.NODE_ENV || "development",
    hasKey: Boolean(key),
  };
}
