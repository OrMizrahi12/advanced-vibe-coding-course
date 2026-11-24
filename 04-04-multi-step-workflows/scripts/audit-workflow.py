# Dynamic workflow for /run-workflow: parallel fan-out & aggregation
SCHEMA = {
    "type": "object",
    "properties": {
        "file": {"type": "string"},
        "status": {"type": "string", "enum": ["OK", "WARN"]},
        "note": {"type": "string"},
    },
    "required": ["file", "status", "note"],
}
phase("Discover")
files = await agent(
    "List every .js file under src/. Return paths only.",
    schema={"type": "array", "items": {"type": "string"}}, model="flash",
)
phase("Audit")
rows = await parallel(files, lambda f: agent(
    f"Audit {f} for input checks and debug logs.",
    schema=SCHEMA, role=f"Audit {f}", model="flash",
))
for r in rows: log(f"{r['file']}: {r['status']} - {r['note']}")
