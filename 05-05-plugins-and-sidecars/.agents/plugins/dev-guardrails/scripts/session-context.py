#!/usr/bin/env python3
import json, subprocess as sp, sys
from pathlib import Path
LOG = "/tmp/session-context.jsonl"
def git(cwd, *args):
    r = sp.run(["git", *args], cwd=cwd, capture_output=True, text=True, timeout=3)
    return r.stdout.strip() if r.returncode == 0 else ""
cwd = json.load(sys.stdin).get("cwd") or "."
branch = git(cwd, "branch", "--show-current") or "detached"
dirty = git(cwd, "status", "--short").splitlines()[:8]
tf = Path(cwd) / "TODO.md"
lines = tf.read_text(encoding="utf-8").splitlines() if tf.exists() else []
todos = [s.strip() for s in lines if s.strip().startswith("- [ ]")][:5]
msg = (f"Live repo context: branch={branch}\n"
       f"Dirty: {', '.join(dirty) or 'clean'}\n"
       f"Open TODOs: {' | '.join(todos) or 'none'}")
with open(LOG, "a", encoding="utf-8") as fh:
    fh.write(json.dumps({"branch": branch, "dirty": dirty, "todos": todos}) + "\n")
print(json.dumps({"injectSteps": [{"systemMessage": {"systemMessage": msg}}]}))
