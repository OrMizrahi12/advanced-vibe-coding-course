#!/usr/bin/env python3
import json, sys
from datetime import datetime, timezone

TRACE = "/tmp/hook-trace.jsonl"
payload = json.load(sys.stdin)
tc = payload.get("toolCall") or {}
record = {
    "ts": datetime.now(timezone.utc).strftime("%H:%M:%S"),
    "hookEventName": payload.get("hookEventName"),
    "cwd": payload.get("cwd"),
    "tool": tc.get("name"),
    "toolCallId": tc.get("id"),
    "stepIdx": payload.get("stepIdx"),
    "terminationReason": payload.get("terminationReason"),
    "keys": sorted(payload.keys()),
}
with open(TRACE, "a", encoding="utf-8") as fh:
    fh.write(json.dumps(record) + "\n")
print('{"decision":"allow"}' if record["hookEventName"] == "PreToolUse" else "{}")
