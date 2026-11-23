# Tmux Fundamentals Cheat Sheet (Stock Default Keybindings)

A concise, printable reference for every `tmux` command and default `Ctrl-b` chord covered in Lesson 2.1.

> **How chords work:** Press and hold `Ctrl`, tap `b`, **release both keys**, then tap the command key.

---

## 1. Install & Verify

| Platform | Command |
| --- | --- |
| Verify version | `tmux -V` |
| Ubuntu / Debian | `sudo apt-get update && sudo apt-get install -y tmux` |
| macOS (Homebrew) | `brew install tmux` |

---

## 2. Session Lifecycle (Shell Commands)

| Command | What It Does |
| --- | --- |
| `tmux new -s factory` | Create and attach to a new named session (`factory`). |
| `tmux ls` | List all active sessions running inside the background `tmux` server. |
| `tmux attach -t factory` | Re-attach to an existing named session (`tmux a -t factory` also works). |
| `tmux kill-session -t factory` | Permanently terminate a named session and all processes inside it. |
| `tmux kill-server` | Stop the entire `tmux` server and every active session cleanly. |

> **Critical boundary:** `Ctrl-b d` **detaches** your viewport while keeping all running agents and watchers alive. `tmux kill-session -t <name>` **ends** the session permanently.

---

## 3. Panes (Inside a Window)

| Chord | Action | Memory Hook |
| --- | --- | --- |
| `Ctrl-b %` | Split active pane **left / right** | `%` has a vertical slash dividing two sides |
| `Ctrl-b "` | Split active pane **top / bottom** | `"` splits horizontally across a shelf |
| `Ctrl-b` + `Arrow` (`←` `→` `↑` `↓`) | Move focus to an adjacent pane | Active pane border highlights bright green |
| `Ctrl-b z` | Toggle **Pane Zoom** (full screen ↔ grid) | Status bar appends `Z` (`0:bash*Z`) while zoomed |
| `exit` (or `Ctrl-d`) | Close the currently focused pane | Closes the shell inside that pane only |

---

## 4. Windows (Full-Screen Tabs)

| Chord | Action | Status Bar Marker |
| --- | --- | --- |
| `Ctrl-b c` | **Create** a new full-screen window | New tab appears (`1:bash*`) |
| `Ctrl-b ,` | **Rename** the active window (`Ctrl-u` clears old name) | Updates tab name (`1:logs*`) |
| `Ctrl-b 0` … `9` | Jump straight to window by index number | `*` marks active tab, `-` marks previous tab |
| `Ctrl-b n` / `Ctrl-b p` | Jump to **next** / **previous** window | Cycles tabs along bottom bar |

---

## 5. Detach & Survive Disconnects

| Step | Input | Result |
| --- | --- | --- |
| Detach safely | `Ctrl-b d` | Prints `[detached (from session factory)]`; all panes & windows keep running |
| Close terminal / drop SSH | `exit` or close window | Viewport closes; `tmux` server keeps background agents alive |
| Inspect surviving work | `tmux ls` | Prints `factory: 2 windows ...` |
| Reconnect intact | `tmux attach -t factory` | Restores exact pane grid, live watchers, and completed agent output |

---

## 6. Reading the Default Green Status Bar

```text
[factory] 0:bash*Z 1:logs-                    "superposition" 23:32 22-Nov-26
 │        │ │    │ │     │                     │               └─ system clock
 │        │ │    │ │     └─ "-" = previously active window
 │        │ │    │ └─ window 1 renamed to "logs"
 │        │ │    └─ "Z" = active pane is zoomed full screen
 │        │ └─ "*" = currently active window
 │        └─ window index & name
 └─ named session (-s factory)
```
