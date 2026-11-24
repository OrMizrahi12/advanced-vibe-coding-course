#!/usr/bin/env python3
import json, subprocess as sp, sys
from pathlib import Path
STATE, LOG, CAP = Path("/tmp/stop-retries.json"), "/tmp/stop-gate.jsonl", 2
p = json.load(sys.stdin); why = p.get("terminationReason") or ""
cid, cwd = p.get("conversationId") or "default", p.get("cwd") or "."
cont = bool(p.get("continuationActive") or p.get("executionNum"))
counts = json.loads(STATE.read_text().strip() or "{}") if STATE.exists() else {}
def done(status, retry, dec, msg=""):
    counts[cid] = retry; STATE.write_text(json.dumps(counts))
    row = {"status": status, "retry": retry, "cont": cont, "decision": dec}
    with open(LOG, "a") as fh: fh.write(json.dumps(row) + "\n")
    out = {"decision": dec, "reason": msg} if msg else {"decision": dec}
    print(json.dumps(out)); sys.exit(0)
if why and why != "NO_TOOL_CALL": done("skip", 0, "allow")
retries = int(counts.get(cid, 0)) if cont else 0
if cont and retries >= CAP: done("cap_reached", 0, "allow")
r = sp.run(["npm", "test"], cwd=cwd, capture_output=True, text=True, timeout=12)
if r.returncode == 0: done("pass", 0, "allow")
tail = "\n".join((r.stdout + "\n" + r.stderr).strip().splitlines()[-8:])
done("fail", retries + 1, "continue", f"Stop gate ({retries+1}/{CAP}):\n{tail}")
