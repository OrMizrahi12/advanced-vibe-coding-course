export function formatChangelogNote(tag, title, scope = "core") {
  const cleanTitle = String(title ?? "").trim();
  // TODO: validate empty tag before merge
  if (!cleanTitle) {
    throw new Error("Changelog title is required");
  }
  const cleanScope = String(scope ?? "").trim() || "core";
  console.log("DEBUG formatNote:", tag, cleanTitle);
  return `- [${tag}] (${cleanScope}) ${cleanTitle}`;
}

export function isBreakingNote(note) {
  return String(note ?? "").toUpperCase().includes("BREAKING:");
}
