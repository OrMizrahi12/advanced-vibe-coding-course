# Lesson 3.3: Progressive Disclosure — Pointers Over Dumps

Welcome to Lesson 3.3 of **Advanced Vibe Coding**. This kit includes the exact 18-line (`765`-byte) refactored `AGENTS.md` Context Index (`-92.6%` smaller than the `249`-line / `10,283`-byte monolithic spec dump), the three modular on-demand reference files under `docs/` (`4,616` bytes total sitting at zero token cost on disk until triggered), and the verified `agy -p "<prompt>" --mode plan --output-format stream-json` + `jq` commands that prove single-doc retrieval live.

## Learning Outcomes

1. Replace monolithic upfront spec dumps with an 18-line `AGENTS.md` Context Index.
2. Split database, HTTP API, and testing conventions into modular `docs/` files loaded strictly on demand.
3. Verify selective single-doc reads live using `agy -p "<prompt>" --mode plan --output-format stream-json` piped through `tee` and `jq`.

## Core Vocabulary

| Term | Definition |
| --- | --- |
| **Progressive disclosure** | Exposing detailed reference context in layers strictly when active work requires it. |
| **Context index** | A compact root routing table pairing each task domain with a file pointer and clear load trigger. |
| **Just-in-time retrieval** | Fetching deep reference specs strictly when an active task matches its routing trigger so unmatched docs burn zero tokens. |

## Before vs. After Context Footprint

| File | Lines | Bytes | Always Loaded? |
| --- | ---: | ---: | --- |
| Legacy Monolithic `AGENTS.md` *(Before)* | `249` | `10,283` | Yes — injected on every turn with zero truncation warning (`< 24 KB`) |
| Refactored `AGENTS.md` Context Index *(After)* | `18` | `765` | Yes — **`-92.6%`** cut in always-loaded root context |
| `docs/schema.md` | `45` | `1,716` | No — `0` tokens until a schema/SQL task matches |
| `docs/api-contracts.md` | `33` | `1,444` | No — `0` tokens until an HTTP/API task matches |
| `docs/testing.md` | `37` | `1,456` | No — `0` tokens until a testing/fixture task matches |
| **Modular `docs/` Total on Disk** | **`115`** | **`4,616`** | **Loaded selectively one file at a time** |

## Progressive Disclosure Design Rules

- **Keep root `AGENTS.md` under ~20 lines:** Store only verified commands, repo-wide invariants, scoped folder pointers, and your routing table.
- **Pair every pointer with an explicit load trigger:** Use a three-column table (`Task Area | Pointer | Load Only When`) instead of bare bulleted links so the agent never bulk-reads unrelated files.
- **Include an explicit anti-preload rule:** State `Read ONLY the file matching your task; never preload unrelated docs.` directly above the table.
- **Keep each modular doc crisp (~30–50 lines):** Split by domain (`schema`, `api-contracts`, `testing`) so one targeted file read brings high-signal conventions without crowding active attention.

## Included Files

- [`AGENTS.md`](./AGENTS.md) — Exact 18-line (`765`-byte) Context Index with verified invariants, anti-preload rule, and 3-row conditional routing table.
- [`docs/schema.md`](./docs/schema.md) — Exact 45-line (`1,716`-byte) PostgreSQL 16 schema, indexes, and expand-then-contract migration reference.
- [`docs/api-contracts.md`](./docs/api-contracts.md) — Exact 33-line (`1,444`-byte) HTTP headers (`X-Request-Id`, `X-Idempotency-Key`), JSON envelope, `POST /v1/refunds`, and canonical error codes (`ERR_REFUND_OVERDRAFT`).
- [`docs/testing.md`](./docs/testing.md) — Exact 37-line (`1,456`-byte) native `node:test`, frozen `makeInvoiceFixture` + `FIXED_NOW_ISO`, boundary matrix (`0`, `9999`, `10000`), and overdraft checks.

## Reproducible Selective-Retrieval Walkthrough

> **Prerequisite:** Start from `/workspace/lab-context` on `main` (continuing from Lesson 3.2, with `package.json`, `src/invoice.js`, `src/format.js`, `test/invoice.test.js`, `backend/`, and `frontend/`).

### 1. Stage the Context Index & Modular `docs/` Files

```bash
mkdir -p /workspace/lab-context/docs
cp AGENTS.md /workspace/lab-context/AGENTS.md
cp docs/schema.md docs/api-contracts.md docs/testing.md /workspace/lab-context/docs/

cd /workspace/lab-context

# Inspect all 18 lines of the Context Index on one calm screen
nl -ba AGENTS.md

# Verify exact line & byte counts (expect: 18 lines / 765 bytes for AGENTS.md; 115 lines / 4616 bytes across docs/)
wc -l -c AGENTS.md && echo "---" && wc -l -c docs/*.md
```

### 2. Task 1 — Prove API Endpoint Planning Reads ONLY `docs/api-contracts.md`

> **CLI flag order note:** Pass the prompt string immediately after `-p`, followed by `--mode plan --output-format stream-json`. Notice this prompt never mentions `docs/api-contracts.md` by name.

```bash
agy -p \
  "Plan a new POST /v1/refunds HTTP endpoint for this repo. Print concise"\
" single-line bullets (no multi-line code blocks) covering required headers,"\
" status codes, one-line JSON envelope, and error codes in your reply." \
  --mode plan --output-format stream-json \
  | tee /tmp/task-api.ndjson \
  | jq -r --unbuffered 'select(.step_update.state=="DONE"
      and (.step_update.tool_name // "" | test("read_file|view_file")))
      | "read_file: \(.step_update.tool_info.parameters.Path)"'
```

Inspect the retrieved API contract conventions from the saved stream:

```bash
jq -r 'select(.event=="result") | .result.response' \
  /tmp/task-api.ndjson | grep -E '^(#| *- |\|| *[0-9]+\.)' \
  | fold -s -w 98 | head -n 20
```

Expected proof:
- Live `jq` output shows `read_file: /workspace/lab-context/docs/api-contracts.md` and **zero** reads of `docs/schema.md` or `docs/testing.md`.
- Final plan cites `X-Request-Id`, `X-Idempotency-Key`, `201 Created`, `409` / `ERR_REFUND_OVERDRAFT`, and the `{ ok, data, error }` JSON envelope.

### 3. Task 2 — Prove Test Planning Reads ONLY `docs/testing.md`

Notice this prompt never mentions `docs/testing.md` by name either.

```bash
agy -p \
  "Plan unit tests and fixture helpers for backend/refund-handler.js"\
" covering partial refunds, boundary values, and overdrafts. Print a"\
" concise single-line bullet summary (no multi-line code blocks) of runner,"\
" test path, fixture helpers, boundary cases, and overdraft checks." \
  --mode plan --output-format stream-json \
  | tee /tmp/task-test.ndjson \
  | jq -r --unbuffered 'select(.step_update.state=="DONE"
      and (.step_update.tool_name // "" | test("read_file|view_file")))
      | "read_file: \(.step_update.tool_info.parameters.Path)"'
```

Inspect the retrieved testing conventions from the saved stream:

```bash
jq -r 'select(.event=="result") | .result.response' \
  /tmp/task-test.ndjson | grep -E '^(#| *- |\|| *[0-9]+\.)' \
  | fold -s -w 98 | head -n 20
```

Expected proof:
- Live `jq` output shows `read_file: /workspace/lab-context/docs/testing.md` (alongside `backend/refund-handler.js`) and **zero** reads of `docs/schema.md` or `docs/api-contracts.md`.
- Final plan cites native `node:test`, `test/refund-handler.test.js`, frozen `makeInvoiceFixture` with `FIXED_NOW_ISO`, `9999` vs `10000` boundaries, and structured overdraft envelope assertions without throwing.

### 4. Save Read Receipts, Clean Scratch Logs & Commit Cleanly on `main`

```bash
T1_DOCS=$(jq -r 'select(.step_update.state=="DONE"
  and (.step_update.tool_name // "" | test("read_file|view_file")))
  | .step_update.tool_info.parameters.Path | select(contains("/docs/"))
  | sub("^/workspace/lab-context/"; "")' /tmp/task-api.ndjson | xargs) && \
T2_DOCS=$(jq -r 'select(.step_update.state=="DONE"
  and (.step_update.tool_name // "" | test("read_file|view_file")))
  | .step_update.tool_info.parameters.Path | select(contains("/docs/"))
  | sub("^/workspace/lab-context/"; "")' /tmp/task-test.ndjson | xargs) && \
rm /tmp/task-api.ndjson /tmp/task-test.ndjson && \
git add AGENTS.md docs/ && \
git commit -m "docs: refactor AGENTS.md into progressive context index"
```

### 5. Single-Screen Ground-Truth Verification Board

```bash
clear && printf "%s\n" \
  "=== AGENTS.md SIZE DROP ===" \
  "BEFORE: 249 lines  10283 bytes" \
  "AFTER :  18 lines    765 bytes  (-92.6%)" "" \
  "=== SELECTIVE READ PROOF (stream-json + jq) ===" \
  "$(printf "Task 1 (API)  -> %-22s (other docs: 0)" "$T1_DOCS")" \
  "$(printf "Task 2 (Test) -> %-22s (other docs: 0)" "$T2_DOCS")" "" \
  "=== REPO VERIFICATION ===" && \
  npm test --silent | grep --color=never -E '^# (tests|pass|fail|duration)' && \
  echo "git status -s: $(git status -s | wc -l) dirty files"
```
