#!/usr/bin/env python3
import json, re, sys
DANGER = re.compile(r"\brm\s+-[a-z]*(rf|fr)|\bgit\s+push\b.*(\s-f|--force)\b")
ENV_RE = re.compile(r"(^|[\s/'\"=])\.env(\.[a-z0-9_-]+)?($|[\s/'\"&;|])", re.I)
GIT_ST = re.compile(r"(^|&&\s*)git\s+status$")
def emit(tool, rule, out):
    with open("/tmp/guard-audit.jsonl", "a", encoding="utf-8") as fh:
        fh.write(json.dumps({"tool": tool, "rule": rule, **out}) + "\n")
    print(json.dumps(out)); sys.exit(0)
tc = json.load(sys.stdin).get("toolCall") or {}
tool, args = tc.get("name", ""), tc.get("args") or {}
k = next((x for x in ("CommandLine", "commandLine", "command") if x in args), "")
cmd = str(args.get(k, "")).strip()
if any(ENV_RE.search(str(v)) for v in args.values()):
    emit(tool, "deny_env", {"decision": "deny", "reason": "Blocked .env secret."})
if tool == "run_command" and DANGER.search(cmd):
    emit(tool, "deny_cmd", {"decision": "deny", "reason": "Blocked unsafe cmd."})
if tool == "run_command" and GIT_ST.search(cmd):
    rw = GIT_ST.sub(r"\1git status --short --branch", cmd)
    emit(tool, "overwrite", {"decision": "allow", "overwrite": {k: rw}})
emit(tool, "allow", {"decision": "allow"})
