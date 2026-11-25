# Advanced Vibe Coding — Course Materials

Official companion repository for **Advanced Vibe Coding: Terminal Agents, Tmux Fleets, Loop Engineering & Shipping to Production**.

Every one of the **42 lessons across 9 sections** has its own numbered folder containing starter projects, configuration templates, shell scripts, cheat sheets, and verified checkpoints so you can build step-by-step on your own machine or jump cleanly into any module.

---

## Quick Start & Prerequisites

### Local Environment
- **OS / Shell:** Linux, macOS, or Windows (WSL2) with `bash` or `zsh`
- **Git:** 2.30+ (with `git worktree` support)
- **Node.js:** 20+ LTS (`node --test`, `npm`)
- **Python:** 3.10+ (for lifecycle hook scripts and dynamic workflows)
- **CLI utilities:** `curl`, `jq`, and `tmux` (installed step-by-step in Sections 1 and 2)

### Free-Tier Accounts Used Across the Course ($0 Stack)
- **Google account** — free entry tier for **Google Antigravity CLI (`agy`)** (installed in Lesson 1.3)
- **GitHub account** — repositories, Pull Requests via `gh` CLI, and GitHub Actions CI/CD (Sections 6 & 8)
- **Supabase account** — free cloud Postgres, Auth, Row Level Security (RLS), CLI migrations, and Remote MCP (Sections 6, 8 & 9)
- **Vercel account** — Hobby free tier for Preview & Production deployments via CLI (Sections 8 & 9)
- **Cloudflare account** — free Workers/Pages deployments via `wrangler` CLI (Section 8)

### Clone This Repository
Copy the clone URL from the **Code** button on this repository page, then run:

```bash
git clone <repository-url>
cd advanced-vibe-coding-course
```

Every lesson folder includes a standalone `README.md` explaining exact prerequisites, commands, and verification checks for that lesson.

### Universal Patterns, Real Execution
All patterns in this course (`tmux`, `git worktree`, hierarchical `AGENTS.md`, open `SKILL.md` Agent Skills, lifecycle `hooks.json`, MCP, Ralph Wiggum outer loops, and free-tier cloud deployments) transfer cleanly across terminal coding agents (Antigravity CLI, Claude Code, Codex CLI, OpenCode). Live walkthroughs use **Google Antigravity CLI (`agy`)**.

---

## Full Course Index (9 Sections · 42 Lessons)

### Section 1 · Terminal Agent Foundations (4 Lessons)
| Lesson | Folder | Focus & Included Materials |
|---|---|---|
| **1.1** | [`01-01-from-chatbots-to-terminal-commanders/`](./01-01-from-chatbots-to-terminal-commanders/) | From Chatbots to Terminal Commanders — 4-layer stack guide & starter agent layout |
| **1.2** | [`01-02-picking-your-terminal-agent/`](./01-02-picking-your-terminal-agent/) | Picking Your Terminal Agent — `agy` vs. Claude Code, Codex & legacy Gemini CLI portability map |
| **1.3** | [`01-03-installing-antigravity-cli/`](./01-03-installing-antigravity-cli/) | Installing & Mastering Antigravity CLI (`agy`) From Zero — install checklist, `@`, `!`, `/plan`, `/rewind`, `--sandbox` |
| **1.4** | [`01-04-headless-unix-pipe/`](./01-04-headless-unix-pipe/) | Headless Automation Mode (`agy -p`) — `stdin` piping, `json`/`stream-json` parsing & `scripts/diff-check.sh` commit gate |

### Section 2 · Tmux Command Center & Parallel Agent Fleets (6 Lessons)
| Lesson | Folder | Focus & Included Materials |
|---|---|---|
| **2.1** | [`02-01-tmux-fundamentals/`](./02-01-tmux-fundamentals/) | Tmux Fundamentals — sessions, windows, panes, detach/attach cheat sheet |
| **2.2** | [`02-02-minimalist-tmux-conf/`](./02-02-minimalist-tmux-conf/) | Crafting a Minimalist AI Operator `.tmux.conf` — Matrix HUD config, `\|`/`-` splits, Vim navigation & reload |
| **2.3** | [`02-03-git-worktrees-explained/`](./02-03-git-worktrees-explained/) | Git Worktrees Explained — `fleet-demo` starter repo, worktree isolation & teardown cheat sheet |
| **2.4** | [`02-04-three-parallel-agents/`](./02-04-three-parallel-agents/) | Running 3 Parallel AI Agents Across Tmux Panes & Worktrees — scoped brief templates & file-ownership checklist |
| **2.5** | [`02-05-scriptable-tmux-fleets/`](./02-05-scriptable-tmux-fleets/) | Scriptable Tmux Automation — `launch-fleet.sh` (`send-keys -l`) & `fleet-status.sh` (`capture-pane`) |
| **2.6** | [`02-06-orchestrator-merge-patterns/`](./02-06-orchestrator-merge-patterns/) | Orchestrator + Worker Patterns & Clean Branch Merging — fan-out/fan-in review, conflict resolution & teardown |

### Section 3 · Context Engineering — Mastering Agent Memory & Focus (5 Lessons)
| Lesson | Folder | Focus & Included Materials |
|---|---|---|
| **3.1** | [`03-01-context-rot-dumb-zone/`](./03-01-context-rot-dumb-zone/) | Context Rot & The Dumb Zone — `lab-context` benchmark repo & signal-to-noise pruning checklist |
| **3.2** | [`03-02-hierarchical-agents-md/`](./03-02-hierarchical-agents-md/) | Hierarchical Rules (`AGENTS.md` / `GEMINI.md`) — 24 KB / 20k-token budget audit, lean root & scoped folder rules |
| **3.3** | [`03-03-progressive-disclosure/`](./03-03-progressive-disclosure/) | Progressive Disclosure: Pointers Over Dumps — compact `AGENTS.md` index & modular `docs/` specs |
| **3.4** | [`03-04-session-hygiene/`](./03-04-session-hygiene/) | Session Hygiene: `/compact`, `/fork`, `/rewind` & Disk-Based Handoffs — `SPEC.md`, `PROGRESS.md` & `HANDOFF.md` templates |
| **3.5** | [`03-05-custom-subagents/`](./03-05-custom-subagents/) | Custom Subagents — read-only `security-auditor` & `codebase-researcher` `.agents/agents/*/agent.md` configs |

### Section 4 · Agent Skills, Custom Commands & Dynamic Workflows (5 Lessons)
| Lesson | Folder | Focus & Included Materials |
|---|---|---|
| **4.1** | [`04-01-inside-agent-skill/`](./04-01-inside-agent-skill/) | Inside an Agent Skill: The Open `SKILL.md` Standard — `lab-skills` starter repo & `release-audit` anatomy bundle |
| **4.2** | [`04-02-first-production-skill/`](./04-02-first-production-skill/) | Building Your First Production Skill & `/<skill>` Command — third-person triggers & `.agents/skills/pr-readiness/` |
| **4.3** | [`04-03-advanced-skills-scripts/`](./04-03-advanced-skills-scripts/) | Advanced Skills: `scripts/`, Validation Gates & `skills.json` — `verify_env.sh`, `checklist.md` & shared manifest inheritance |
| **4.4** | [`04-04-multi-step-workflows/`](./04-04-multi-step-workflows/) | Multi-Step Workflows — 4-stage `/feature-flow` skill & parallel Python `scripts/audit-workflow.py` (`/run-workflow`) |
| **4.5** | [`04-05-evaluating-hardening-skills/`](./04-05-evaluating-hardening-skills/) | Evaluating & Hardening Skills — headless `eval-pr-skill.sh` harness, `.tmpl` fixtures & hardened `verify_env.sh` |

### Section 5 · Lifecycle Hooks, Guardrails, Plugins & Sidecars (5 Lessons)
| Lesson | Folder | Focus & Included Materials |
|---|---|---|
| **5.1** | [`05-01-agent-lifecycle-hooks/`](./05-01-agent-lifecycle-hooks/) | The Agent Lifecycle Visualized — `lab-hooks` starter repo, `.agents/hooks.json` & `scripts/hook-logger.py` |
| **5.2** | [`05-02-pretooluse-safety-gates/`](./05-02-pretooluse-safety-gates/) | `PreToolUse` Safety Gates & Argument Rewriting — `scripts/pretool-guard.py` (`allow`, `deny`, `force_ask`, `overwrite`) |
| **5.3** | [`05-03-posttooluse-auto-quality/`](./05-03-posttooluse-auto-quality/) | `PostToolUse` Auto-Quality Loops — sub-2s format/lint/`tsc` loop & `PostInvocation` relay (`scripts/posttool-quality.py`) |
| **5.4** | [`05-04-sessionstart-stop-hooks/`](./05-04-sessionstart-stop-hooks/) | `SessionStart`, `PreInvocation` & `Stop` Hooks — `session-context.py` (`injectSteps`) & bounded `stop-test-gate.py` |
| **5.5** | [`05-05-plugins-and-sidecars/`](./05-05-plugins-and-sidecars/) | Packaging Into Portable Plugins & Sidecars — `.agents/plugins/dev-guardrails/`, `plugin.json`, `plugins.json` & `sidecar.json` |

### Section 6 · MCP & Live Tooling — Connecting Agents to Real Infrastructure (3 Lessons)
| Lesson | Folder | Focus & Included Materials |
|---|---|---|
| **6.1** | [`06-01-mcp-under-the-hood/`](./06-01-mcp-under-the-hood/) | Model Context Protocol (MCP) Under the Hood — Stdio vs. Streamable HTTP `mcp_config.json` & tool-budget checklist |
| **6.2** | [`06-02-supabase-mcp-and-gh/`](./06-02-supabase-mcp-and-gh/) | Live Infrastructure Tools: Supabase Remote MCP & `gh` CLI — OAuth remote MCP setup & hybrid CLI/MCP workflows |
| **6.3** | [`06-03-playwright-browser-verification/`](./06-03-playwright-browser-verification/) | Giving Terminal Agents Eyes With Playwright — headless Chromium verification script, console-error gates & UI smoke skill |

### Section 7 · Loop Engineering — Autonomous Self-Healing Systems (5 Lessons)
| Lesson | Folder | Focus & Included Materials |
|---|---|---|
| **7.1** | [`07-01-loop-engineering-inner-outer/`](./07-01-loop-engineering-inner-outer/) | What Is Loop Engineering? — Inner `Stop` loops vs. outer fresh-context Ralph Wiggum loop benchmarks |
| **7.2** | [`07-02-backpressure-engineering/`](./07-02-backpressure-engineering/) | Backpressure Engineering: Deterministic Gates — layered `npm run verify` gate (`tsc`, lint, unit & E2E checks) |
| **7.3** | [`07-03-ralph-wiggum-loop/`](./07-03-ralph-wiggum-loop/) | Building Your First Ralph Wiggum Loop Around `agy -p` — `ralph.sh`, `PRD.json`, `PROMPT.md` & `PROGRESS.md` |
| **7.4** | [`07-04-circuit-breakers-sandbox/`](./07-04-circuit-breakers-sandbox/) | Circuit Breakers, Cost Guards & Sandbox Safety — `--max-iters`, stuck-diff hash tripwire & `--sandbox` hardening |
| **7.5** | [`07-05-parallel-ralph-fleets/`](./07-05-parallel-ralph-fleets/) | Parallel Ralph Fleets in Tmux — `fleet-ralph.sh` 4-pane launcher & live `PRD.json` fleet dashboard |

### Section 8 · Shipping to Real Production on a $0 Free-Tier Stack (5 Lessons)
| Lesson | Folder | Focus & Included Materials |
|---|---|---|
| **8.1** | [`08-01-zero-dollar-architecture/`](./08-01-zero-dollar-architecture/) | The $0 Production Architecture & 2026 Limits — GitHub, Supabase, Vercel & Cloudflare decision matrix |
| **8.2** | [`08-02-supabase-terminal-migrations/`](./08-02-supabase-terminal-migrations/) | Supabase From the Terminal — linked cloud SQL migrations (`supabase db push`), generated TypeScript types & Auth |
| **8.3** | [`08-03-rls-security-audits/`](./08-03-rls-security-audits/) | Row Level Security (RLS) & Security Audits — `auth.uid()` policies, Supabase Security Advisor checks & cross-user tests |
| **8.4** | [`08-04-vercel-and-cloudflare-deploy/`](./08-04-vercel-and-cloudflare-deploy/) | Shipping to Vercel & Cloudflare From the Terminal — Preview vs. Production deploys, `vercel env` & `wrangler deploy` |
| **8.5** | [`08-05-github-actions-ci-cd/`](./08-05-github-actions-ci-cd/) | Automated CI/CD & Agentic PR Gates — `.github/workflows/ci.yml`, required PR checks & auto-deploy pipelines |

### Section 9 · Capstone: Building Your Prompt-to-Production Software Factory (4 Lessons)
| Lesson | Folder | Focus & Included Materials |
|---|---|---|
| **9.1** | [`09-01-software-factory-blueprint/`](./09-01-software-factory-blueprint/) | Designing the Software Factory Blueprint — 5-stage prompt-to-production architecture & **ShipPulse** spec |
| **9.2** | [`09-02-software-factory-plugin/`](./09-02-software-factory-plugin/) | Assembling the Reusable `software-factory` Plugin & `factory.sh` — drop-in `.agents/plugins/software-factory/` bundle |
| **9.3** | [`09-03-live-factory-part-1/`](./09-03-live-factory-part-1/) | Live Factory Run (Part 1): One Prompt → Verified Code — `/factory-spec`, parallel `factory.sh` Ralph loops & green verification |
| **9.4** | [`09-04-live-factory-part-2/`](./09-04-live-factory-part-2/) | Live Factory Run (Part 2): DB Push, Prod Deploy & Live Smoke Test — `/factory-audit`, `/factory-ship` & final playbook |

---

## Repository Hygiene & Security Notes
- Never commit `.env` files or API secrets; every starter project ships with `.env.example` and a `.gitignore` covering `.env*`.
- All cloud labs use real free tiers (`supabase link`, `vercel`, `wrangler`, `gh`) with zero paid subscriptions required.
- Every lesson kit is tested independently with standard commands (`node --test`, `npm test`, `bash -n`, `python3 -m py_compile`) before release.
