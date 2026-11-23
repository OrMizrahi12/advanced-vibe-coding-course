# Lesson 2.2: Crafting a Minimalist AI Operator `.tmux.conf`

This student kit contains the exact 41-line `.tmux.conf` built and verified live in Lesson 2.2 of **Advanced Vibe Coding**, along with quick installation steps and a command cheat sheet for supervising parallel terminal coding agents.

## Learning Outcomes

1. Eliminate stock `tmux` friction across splits (`%`/`"` resetting to `$HOME`), 0-based indexing, short 2,000-line scrollback, blank borders, and disabled mouse scrolling.
2. Organize a clean, zero-bloat `~/.tmux.conf` into four pillars: **Ergonomics & Splits**, **Scrollback & Mouse**, **Visual Pane Identity**, and **Zero-Friction Reload**.
3. Reload configuration live with `Ctrl-b r`, preserve your repository path across `|`/`-`/`c` splits, label agent panes with `tmux select-pane -T`, glide across panes with Vim `h/j/k/l`, and mouse-scroll deep agent output.

## Core Vocabulary

| Term | Definition |
| --- | --- |
| **Scrollback buffer** | The memory queue holding terminal lines scrolled above the visible pane (`history-limit 50000`). |
| **Pane title** | An explicit role label pinned to a pane's top border (`pane-border-status top` + `tmux select-pane -T`) so parallel agents stay identifiable at a glance. |
| **Config reload** | Sourcing updated `.tmux.conf` rules inside a live `tmux` session (`Ctrl-b r`) without stopping running agents. |

## Quick Install

```bash
# Back up any existing config first (optional)
[ -f ~/.tmux.conf ] && cp ~/.tmux.conf ~/.tmux.conf.bak

# Install the 41-line Operator HUD config
cp .tmux.conf ~/.tmux.conf

# Activate inside an already-running tmux session
tmux source-file ~/.tmux.conf
```

> **Note:** New settings such as `base-index 1`, `pane-base-index 1`, and `history-limit 50000` apply automatically to newly opened windows and panes (press `Ctrl-b c` for a fresh 1-based window or launch a new session with `tmux new -s operator`).

## Operator Keybinding Cheat Sheet

| Shortcut / Command | Action |
| --- | --- |
| `Ctrl-b r` | Reload `~/.tmux.conf` live and flash `"tmux config reloaded"` |
| `Ctrl-b \|` | Split vertically (left / right) in the current pane directory |
| `Ctrl-b -` | Split horizontally (top / bottom) in the current pane directory |
| `Ctrl-b c` | Open a new 1-based window in the current pane directory |
| `Ctrl-b h` / `j` / `k` / `l` | Move focus left / down / up / right from home row |
| `tmux select-pane -T "API Agent"` | Pin a custom role label to the active pane's top border |
| Mouse wheel up / `q` | Enter copy mode to scroll 50,000 lines of history; press `q` to return |
| Mouse click on pane | Switch focus directly to any pane |

## Verification Commands

```bash
# Confirm exact 41-line layout
nl -ba ~/.tmux.conf

# Verify 50,000-line scrollback buffer inside tmux
tmux show -g history-limit

# Label a three-pane agent layout
tmux select-pane -T "API Agent"
tmux select-pane -T "UI Agent"
tmux select-pane -T "Test Runner"
```

## Notes on Portability & Truecolor

- **Prefix (`Ctrl-b`):** Kept intentionally as the default prefix so muscle memory stays identical across fresh Linux hosts and remote servers.
- **Truecolor RGB (`tmux >= 3.2`):** Uses `set -as terminal-features ",xterm-256color:RGB"`. On older `tmux < 3.2` installs, replace that single line with `set -ga terminal-overrides ",xterm-256color:Tc"`.
- **Pane title persistence:** If your shell prompt (`PS1` or `PROMPT_COMMAND`) emits xterm OSC 0/2 title escapes (`\e]0;...\a`), strip that title escape from `PS1` so custom `select-pane -T` labels persist across commands.
