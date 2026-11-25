# Lesson 5.5: Packaging Into Portable Plugins (`plugin.json`) & Sidecars (`sidecar.json`)

Welcome to Lesson 5.5 of **Advanced Vibe Coding**. This kit includes the complete portable `.agents/plugins/dev-guardrails/` plugin bundle (combining `plugin.json`, `rules/AGENTS.md`, `skills/guard-check/SKILL.md`, root-level `hooks.json`, all 5 executable Python hooks, and the `sidecars/test-watcher/` daemon), plus team sharing (`examples/plugins.json`) and per-user toggle (`examples/config-toggle.json`) templates.

## Learning Outcomes

1. Package rules (`rules/AGENTS.md`), skills (`skills/<name>/SKILL.md`), and root-level `hooks.json` (`./scripts/...`) into a single namespaced plugin behind `plugin.json` and pass `agy plugin validate`.
2. Toggle an entire bundled guardrail stack cleanly on and off via `~/.gemini/config/config.json` (preserving user preferences across plugin updates) and share team plugins across repositories via `.agents/plugins.json`.
3. Offload continuous background watchers and cron schedules into managed `sidecar.json` daemons so synchronous lifecycle hooks never stall agent turns.

## Portable Plugin Layout & Critical Root Rules

```text
.agents/plugins/dev-guardrails/
├── plugin.json                     # Required manifest ($schema, kebab-case name, version)
├── hooks.json                      # MUST sit at plugin root (NOT hooks/hooks.json!)
├── rules/
│   └── AGENTS.md                   # Always-on plugin rules (root AGENTS.md is ignored)
├── skills/
│   └── guard-check/
│       └── SKILL.md                # Exposed as /guard-check
├── scripts/                        # Referenced as "./scripts/..." from root hooks.json
│   ├── hook-logger.py
│   ├── pretool-guard.py
│   ├── posttool-quality.py
│   ├── session-context.py
│   └── stop-test-gate.py
└── sidecars/
    └── test-watcher/
        ├── sidecar.json
        └── watch.py
```

### Critical Native Plugin Rules

- **Root `hooks.json`:** Native plugins (directories containing `plugin.json`) MUST place `hooks.json` directly at `<plugin-root>/hooks.json`. Native discovery skips nested `hooks/hooks.json`.
- **Relative `./scripts/...` + env vars:** Plugin hook commands run with `<plugin-root>` as their working directory (so commands switch from `../scripts/` to `./scripts/`) while receiving the repo's `cwd` on `stdin` plus `PLUGIN_ROOT` and `PLUGIN_DATA` environment variables.
- **Automatic Namespacing:** Bundled MCP servers namespace as `<plugin>_<server>` and bundled sidecars namespace as `<plugin>/<sidecar>` (e.g., `dev-guardrails/test-watcher`).
- **Rules placement:** Put plugin rules inside `rules/AGENTS.md` (not at the plugin root) so contributor documentation stays out of user prompts.

## `plugins.json` vs. `config.json` Reference

| File | Scope | Purpose |
| --- | --- | --- |
| `<repo>/.agents/plugins.json` | Team / Git-tracked | Mount shared plugin folders (`entries`, `inherits`, `include_only`, `exclude`) across repos with zero copying |
| `~/.gemini/config/config.json` | Machine-local user config | Override per-plugin `"plugins": { "<dirName>": { "enabled": false \| true } }` (works for both workspace `.agents/plugins/` and global plugins; `agy plugin disable` / `enable` writes the same entry for globally installed plugins) and opt in to `"sidecars": { "<plugin>/<sidecar>": { "enabled": true } }` |

## `sidecar.json` & Built-In Cron Schedule Cheat Sheet

- **Long-running process sidecar:** Declare `display_name`, `description`, `command`, `args`, `restart_policy` (`"always"` | `"on-failure"` | `"never"`), and `env`.
- **Built-in recurring cron sidecar:** Swap `command` / `args` for `"builtin": "schedule"` with a standard 5-field cron expression (e.g., `"schedule": "*/15 * * * *"`).
- **Discovery & logs in Antigravity App:** Installed plugin sidecars load from `~/.gemini/config/plugins/<pluginName>/sidecars/<sidecarName>/sidecar.json`, write logs to `~/.gemini/antigravity/sidecar_data/<sidecarId>/logs/`, and remain off until explicitly enabled in `~/.gemini/config/config.json`.

## Included Files

- [`.agents/plugins/dev-guardrails/`](./.agents/plugins/dev-guardrails/) — Complete 11-file validated plugin (`plugin.json`, `hooks.json`, `rules/AGENTS.md`, `skills/guard-check/SKILL.md`, 5 executable `scripts/*.py`, and `sidecars/test-watcher/{sidecar.json,watch.py}`).
- [`examples/plugins.json`](./examples/plugins.json) — Team-sharing `.agents/plugins.json` registry snippet.
- [`examples/config-toggle.json`](./examples/config-toggle.json) — `~/.gemini/config/config.json` toggle & sidecar opt-in snippet.

## Reproducible Hands-On Walkthrough

> **Prerequisite:** Start from `/workspace/lab-hooks` cleanly committed on `main` (from Lesson 5.4, `pass 6, fail 0`).

```bash
# 1. Remove loose workspace hooks so hooks never double-fire, then copy the plugin bundle
cd /workspace/lab-hooks
git rm .agents/hooks.json scripts/*.py
mkdir -p .agents/plugins
cp -a <kit>/.agents/plugins/dev-guardrails .agents/plugins/dev-guardrails
chmod +x .agents/plugins/dev-guardrails/scripts/*.py \
  .agents/plugins/dev-guardrails/sidecars/test-watcher/watch.py

# 2. Validate JSON & plugin manifest
python3 -m json.tool .agents/plugins/dev-guardrails/plugin.json > /dev/null && \
python3 -m json.tool .agents/plugins/dev-guardrails/hooks.json > /dev/null && \
python3 -m json.tool .agents/plugins/dev-guardrails/sidecars/test-watcher/sidecar.json > /dev/null && \
echo "JSON_OK"
agy plugin validate .agents/plugins/dev-guardrails

# 3. Live ENABLED proof (rules + guard-check skill + root hooks active on turn 1!)
: > /tmp/session-context.jsonl && : > /tmp/hook-trace.jsonl
agy -p "Without running any shell commands or reading any files, report our current git branch, confirm active workspace guardrails, and state whether the guard-check skill is available." \
  --mode plan
jq -c '{ev: .hookEventName, cwd, stop: .terminationReason}' /tmp/hook-trace.jsonl

# 4. Live DISABLED silence proof (0 lines logged, files untouched on disk)
#    (Note: on agy 1.5.15, `agy plugin disable/enable` targets globally installed
#     plugins; setting `plugins["dev-guardrails"].enabled` in config.json toggles
#     workspace `.agents/plugins/` bundles directly.)
python3 - <<'PY'
import json
from pathlib import Path
p = Path.home() / ".gemini/config/config.json"
p.parent.mkdir(parents=True, exist_ok=True)
cfg = json.loads(p.read_text("utf-8")) if p.exists() and p.read_text("utf-8").strip() else {}
cfg.setdefault("plugins", {})["dev-guardrails"] = {"enabled": False}
p.write_text(json.dumps(cfg, indent=2) + "\n", encoding="utf-8")
PY
: > /tmp/session-context.jsonl && : > /tmp/hook-trace.jsonl
agy -p "Without running any shell commands or reading any files, report our current git branch, confirm active workspace guardrails, and state whether the guard-check skill is available." \
  --mode plan
wc -l /tmp/session-context.jsonl /tmp/hook-trace.jsonl    # expects: 0 and 0

# 5. Re-enable & dry-run the sidecar watcher once
python3 - <<'PY'
import json
from pathlib import Path
p = Path.home() / ".gemini/config/config.json"
cfg = json.loads(p.read_text("utf-8"))
cfg.setdefault("plugins", {})["dev-guardrails"] = {"enabled": True}
p.write_text(json.dumps(cfg, indent=2) + "\n", encoding="utf-8")
PY
WATCH_REPO=/workspace/lab-hooks python3 .agents/plugins/dev-guardrails/sidecars/test-watcher/watch.py --once
```
