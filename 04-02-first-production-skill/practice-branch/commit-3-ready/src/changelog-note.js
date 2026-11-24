export function formatChangelogNote(tag, title, scope = "core") {
  const cleanTag = String(tag ?? "").trim();
  const cleanTitle = String(title ?? "").trim();
  if (!cleanTag) {
    throw new Error("Changelog tag is required");
  }
  if (!cleanTitle) {
    throw new Error("Changelog title is required");
  }
  const cleanScope = String(scope ?? "").trim() || "core";
  return `- [${cleanTag}] (${cleanScope}) ${cleanTitle}`;
}

export function isBreakingNote(note) {
  return String(note ?? "").toUpperCase().includes("BREAKING:");
}
