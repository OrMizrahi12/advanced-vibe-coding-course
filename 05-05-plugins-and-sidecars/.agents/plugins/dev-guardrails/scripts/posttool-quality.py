#!/usr/bin/env python3
import json, os, re, subprocess, sys, time
from pathlib import Path
LOG, ERR = Path("/tmp/quality-hook.jsonl"), Path("/tmp/quality-pending.txt")
EXTS = {".js", ".ts", ".jsx", ".tsx"}
KEYS = ("Path", "TargetFile", "AbsolutePath", "file_path", "path")
DBG = re.compile(r"\b(console\.log|debugger)\b")
def pick_path(args, cwd):
    for k in KEYS:
        if isinstance(v := args.get(k), str) and v.strip():
            return Path(os.path.normpath(os.path.join(cwd, v)))
def fmt_lint(path):
    raw = path.read_text("utf-8")
    rows = [s.replace("\t", "  ").rstrip() for s in raw.splitlines()]
    clean = re.sub(r"\n{3,}", "\n\n", "\n".join(rows)).rstrip("\n") + "\n"
    if clean != raw: path.write_text(clean, "utf-8")
    src = "/src/" in path.as_posix()
    errs = [f"{path.name}:{i}: remove debug" for i, s in
            enumerate(clean.splitlines(), 1) if src and DBG.search(s)]
    return clean != raw, errs

p = json.load(sys.stdin)
if p.get("hookEventName") == "PostInvocation":
    msg = ERR.read_text("utf-8").strip() if ERR.exists() else ""
    ERR.unlink(missing_ok=True)
    step = {"systemMessage": {"systemMessage": msg}}
    out = {"injectSteps": [step], "terminationBehavior": "force_continue"}
    sys.exit(print(json.dumps(out if msg else {})) or 0)
cwd = p.get("cwd") or os.getcwd()
path = pick_path((p.get("toolCall") or {}).get("args") or {}, cwd)
if not path or path.suffix not in EXTS or not path.is_file():
    sys.exit(print("{}") or 0)

t0 = time.monotonic()
fmt, errs = fmt_lint(path)
tsc = os.path.join(cwd, "node_modules", ".bin", "tsc")
try:
    r = subprocess.run([tsc, "--noEmit"], cwd=cwd, capture_output=True,
                       text=True, timeout=4)
    if r.returncode: errs += (r.stdout + r.stderr).strip().splitlines()[:6]
except (subprocess.TimeoutExpired, FileNotFoundError) as exc:
    errs.append(f"tsc error: {exc}")
ms = round((time.monotonic() - t0) * 1000)
if errs:
    ERR.write_text("PostToolUse failed:\n" + "\n".join(errs) + "\nFix now.",
                   "utf-8")
else: ERR.unlink(missing_ok=True)
rec = {"file": os.path.relpath(path, cwd), "fmt": fmt,
       "ok": not errs, "ms": ms, "errs": len(errs)}
with LOG.open("a", encoding="utf-8") as fh:
    fh.write(json.dumps(rec) + "\n")
print("{}")
