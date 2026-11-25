#!/usr/bin/env python3
import os, subprocess as sp, sys, time
from pathlib import Path
ROOT = Path(os.getenv("WATCH_REPO", "/workspace/lab-hooks"))
LOG = Path(os.getenv("WATCH_LOG", "/tmp/sidecar-watch.log"))
SEC = int(os.getenv("WATCH_INTERVAL_SEC", "3"))
def stamp(): return {p.name: p.stat().st_mtime for p in ROOT.glob("src/*.js")}
def check():
    r = sp.run(["npm", "test"], cwd=ROOT, capture_output=True, text=True)
    line = f"{time.strftime('%H:%M:%S')} exit={r.returncode}\n"
    with LOG.open("a", encoding="utf-8") as fh: fh.write(line)
    return line.strip()
if "--once" in sys.argv: print(check()); sys.exit(0)
seen = stamp()
while True:
    time.sleep(SEC); now = stamp()
    if now != seen: seen = now; check()
