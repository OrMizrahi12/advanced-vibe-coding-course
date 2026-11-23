# Lesson 1.3: Installing & Mastering Antigravity CLI (`agy`) From Zero

Welcome to **Advanced Vibe Coding**. This starter kit gives you the official install command, the interactive shortcut & flag cheat sheet, and the exact minimal Node repository (`lab-cli/`) used throughout Lesson 1.3 to rehearse `@` file targeting, `!` inline shell checks, `/plan` mode, `/config` sandboxing, `/rewind`, `/fork`, and `/resume`.

## Learning Outcomes

1. Install Google Antigravity CLI (`agy`) on a clean Linux terminal and authenticate with Google OAuth (zero API keys required).
2. Drive the interactive terminal interface with `!` inline shell checks, `@` exact file targeting, `/plan` blueprints, and `/config` safety controls.
3. Control risk cleanly with `/rewind`, `/fork`, `/resume`, and `--sandbox --continue`.

## Core Vocabulary

| Term | Definition |
| --- | --- |
| **Plan mode** | A dedicated review pass (`/plan`) where the agent inspects your codebase and writes a file-by-file blueprint before changing a single line on disk. |
| **Sandbox mode** | OS-level shell isolation (`bubblewrap` namespaces on Linux, Seatbelt on macOS) fencing agent commands inside your project workspace. |
| **Checkpoint rewind** | Atomic rollback (`/rewind`) that reverts modified files on disk and clears dead-end turns from conversation history together. |

## 1. Fresh Install & Core CLI Flags

```bash
# Verify clean environment
which agy

# Install standalone Go binary
curl -fsSL https://antigravity.google/cli/install.sh | bash

# Reload shell PATH & verify version
source ~/.bashrc && agy --version

# Inspect all CLI flags
agy --help
```

| CLI Flag | Purpose |
| --- | --- |
| `--sandbox` | Enables OS-level workspace isolation (`bubblewrap` on Linux, Seatbelt on macOS) for shell tool calls. |
| `--mode <mode>` | Launches directly into `plan`, `accept-edits`, `auto`, or `default` mode. |
| `--continue` | Resumes the most recent saved conversation thread in the current directory. |
| `-p "<prompt>"` | Runs a single headless prompt non-interactively (ideal for shell scripts and CI pipelines). |

## 2. Interactive TUI Shortcut & Command Cheat Sheet

| Input / Command | What It Does |
| --- | --- |
| `! <command>` | Runs a shell command directly in your local terminal (e.g., `! git status`, `! npm test`, `! git diff`) with zero model latency and zero tokens. |
| `@<path>` | Opens repository file autocomplete so you pin exact source and test files upfront on turn one. |
| `/plan` | Switches into **Plan mode** (`Shift+Tab` also cycles modes) to inspect a blueprint before approving edits. |
| `/config` | Opens the interactive settings overlay (backed by `~/.gemini/antigravity-cli/settings.json`), including the **Sandbox Mode** switch. |
| `/rewind` | Opens the checkpoint picker to restore modified files and roll back failed turns together. |
| `/fork` | Clones the current clean conversation state into a new independent branch for speculative experiments. |
| `/resume` | Lists every saved conversation thread scoped to the current project directory so you can switch cleanly. |
| `/exit` (or `Ctrl+D` twice) | Exits the interactive interface cleanly back to your shell prompt. |

## 3. Rehearse Safely with `lab-cli/`

Copy `lab-cli/` anywhere (for example `/workspace/lab-cli`), initialize git, and confirm the baseline passes before launching `agy`:

```bash
cp -r lab-cli /workspace/lab-cli
cd /workspace/lab-cli
git init
npm test
git add -A && git commit -m "init calculator lab"
agy
```

### Prompts Used in This Lesson

1. **Planned feature (`/plan` mode):**
   ```text
   @src/calc.js @test/calc.test.js Add a percentage(value, pct) helper returning (value * pct) / 100 that throws on non-finite input, plus unit tests.
   ```
2. **Deliberate breaking change (for `/rewind` practice):**
   ```text
   @src/calc.js Change divide so it silently returns 0 when b is zero instead of throwing. Edit only src/calc.js and leave tests untouched.
   ```
3. **Speculative enhancement (after `/fork`):**
   ```text
   @src/calc.js @test/calc.test.js Add a clamp(value, min, max) helper and unit tests.
   ```

### Relaunch Sandboxed & Resume

```bash
agy --sandbox --continue
```
