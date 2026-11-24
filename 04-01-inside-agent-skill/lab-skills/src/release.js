export function parseSemver(version) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!m) throw new Error(`Invalid semver: ${version}`);
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) };
}

export function formatTag(version) {
  const v = parseSemver(version);
  return `v${v.major}.${v.minor}.${v.patch}`;
}
