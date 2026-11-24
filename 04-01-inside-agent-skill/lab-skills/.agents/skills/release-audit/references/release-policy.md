# Engineering Release Policy & Audit Reference Manual

This reference manual defines the complete release readiness policy for Node
services in this workspace. Because this document is stored inside
`references/release-policy.md`, terminal agents do not load it at startup.
Agents open this file on demand only when an active release audit encounters
versioning edge cases, changelog ambiguities, security questions, or rollback
requirements.

## 1. Semantic Versioning Rules

Every package version in `package.json` MUST follow strict three-part semantic
versioning (`MAJOR.MINOR.PATCH`) with numeric components and no leading zeros.
Pre-release suffixes such as `-rc.1` or `-beta.2` are allowed only on staging
branches and MUST be stripped before tagging a production release on `main`.

- **Patch bump (`0.0.X`):** Reserved strictly for backward-compatible bug fixes,
  internal refactors that preserve all exported function signatures, test
  additions, and documentation corrections. A patch release must never add new
  required environment variables, alter default return keys, or tighten input
  validation in a way that rejects previously valid caller payloads.
- **Minor bump (`0.X.0`):** Required whenever a release introduces new exported
  functions, optional parameters with safe defaults, new CLI flags, or additive
  response fields. Every new public export must include at least one automated
  unit test covering both the happy path and one explicit error or boundary
  condition.
- **Major bump (`X.0.0`):** Mandatory whenever a change removes an export,
  renames a JSON field, alters an error contract that downstream consumers parse,
  raises the minimum supported Node runtime version, or modifies database schema
  expectations incompatibly. Major releases require a dedicated Migration Notes
  subsection inside `CHANGELOG.md` listing exact before-and-after code snippets.

## 2. Changelog & Tag Alignment Standards

The top versioned heading in `CHANGELOG.md` MUST match the exact `version`
string declared in `package.json` using the canonical format
`## [X.Y.Z] - YYYY-MM-DD`. Unreleased scratch notes may sit above it under
`## [Unreleased]` during development, yet every tagged commit must promote
those bullets under the dated release heading so automated checks verify one
unambiguous release entry.

Each bullet inside a release section should explain the observable impact for
callers rather than repeating raw Git commit hashes. Group entries cleanly
under concise verbs such as Added, Changed, Fixed, Deprecated, or Security.
Never retroactively edit historical release sections after a tag has been
published to the remote repository; if a published tag contains a typo in its
notes, document the clarification in the next patch release instead.

## 3. Automated Test & Working-Tree Gates

Before approving any release tag, the audit must verify all three mechanical
baseline checks on a clean checkout of the target release branch:

1. **Deterministic version script:** `scripts/check-version.sh` must exit with
   status zero and print `VERSION_OK` confirming that `package.json` and
   `CHANGELOG.md` agree on the exact target version string.
2. **Full unit test suite:** `npm test` (running Node's native test runner)
   must report zero failures, zero skipped assertions on release-critical paths,
   and deterministic pass counts across two consecutive runs without relying on
   external network state or local machine clock drift.
3. **Clean Git index:** `git status -s` must return completely empty output so
   no untracked scratch artifacts, local `.env` overrides, or unstaged edits
   slip into the tagged commit. All commits since the previous tag must exist on
   the release branch with clear single-purpose commit messages.

## 4. Security & Secret Hygiene Checklist

Release audits act as the final line of defense against accidental credential
exposure and supply-chain drift. Verify every item below before issuing a
`READY_TO_TAG` verdict:

- Confirm zero `.env`, `.pem`, `.key`, or private credential files are tracked
  by Git (`git ls-files`) or referenced inside published package directories.
- Inspect every shell script inside `scripts/` for `set -euo pipefail`, safe
  variable quoting, and absence of unpinned remote `curl | bash` downloads.
- Verify no hardcoded developer home directories or machine-local absolute paths
  appear anywhere inside `src/`, `test/`, or `.agents/`.
- Confirm `package.json` dependencies stay pinned and minimal. Zero-dependency
  core utilities must remain free of transient packages unless an explicit
  architectural decision record justifies adding one.

## 5. Edge Cases, Hotfixes & Rollback Protocol

When a production defect requires an urgent patch while `main` already carries
unreleased minor features, cut a dedicated hotfix branch directly from the last
published release tag (`git checkout -b hotfix/v1.2.1 v1.2.0`), apply the
minimal tested fix, bump only the patch digit, update `CHANGELOG.md`, and run
the full `release-audit` skill before tagging. Merge the hotfix commit back
into `main` immediately afterward so the next minor release inherits the fix
and never reintroduces the regression.

If a tagged release fails post-deploy smoke checks, never delete or force-move
an already published Git tag. Instead, publish a forward-moving revert or patch
tag (`v1.2.1`) that restores known-good behavior while keeping tag history
immutable for downstream caches and package registries.

## 6. Final Audit Verdict Matrix

Every release audit concludes with one explicit uppercase machine-readable
verdict so automated pipelines and human reviewers share one clear contract:

- **`READY_TO_TAG`:** Version script prints `VERSION_OK`, `npm test` reports
  zero failures, `git status -s` is empty, changelog notes match the semver
  bump, and zero security or path violations exist.
- **`BLOCKED_VERSION_MISMATCH`:** `package.json` and `CHANGELOG.md` disagree,
  or the semver bump level violates Section 1 for the diff being shipped.
- **`BLOCKED_TESTS_OR_DIRTY_TREE`:** Any test fails or uncommitted modifications
  remain in the working tree.
- **`BLOCKED_SECURITY_HYGIENE`:** Tracked secrets, hardcoded machine paths, or
  unsafe shell patterns appear in the release diff.

## 7. Cross-Agent Portability & Skill Maintenance Rules

Keep every asset inside `.agents/skills/release-audit/` plain UTF-8 text and
address sibling files strictly with relative links (`./scripts/`,
`./references/`, `./examples/`). Never embed proprietary tool wrappers,
compiled binaries, or developer home paths inside the skill folder. When teams
adopt a second terminal coding harness—such as Claude Code (`.claude/skills/`)
or Codex (`.agents/skills/`)—the identical folder copies or symlinks across
harnesses without modifying a single line of YAML frontmatter or procedure text.
Whenever release standards evolve, update this reference manual instead of
inflating `SKILL.md` so startup and triggered context overhead stays minimal.
