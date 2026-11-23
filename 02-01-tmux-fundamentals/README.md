# Lesson 2.1: Tmux Fundamentals — Sessions, Windows & Panes Visualized

Welcome to Section 2 of **Advanced Vibe Coding**. This kit pairs the four-tier `tmux` mental model with the printable shortcut reference (`tmux-fundamentals-cheatsheet.md`) and hands-on practice drill from Lesson 2.1.

## Learning Outcomes

1. Explain the four-tier `tmux` hierarchy (`Tmux Server` → `Named Sessions` → `Windows` → `Split Panes`) and why a persistent background server decouples running agents from your desktop terminal window.
2. Verify or install `tmux`, launch named sessions (`tmux new -s factory`), split and navigate panes (`Ctrl-b %`, `"`, arrows), toggle full-screen Pane Zoom (`Ctrl-b z`), and manage named windows (`Ctrl-b c`, `,`, `0`, `1`).
3. Detach cleanly (`Ctrl-b d`), close your entire terminal window without interrupting live tasks, verify surviving sessions (`tmux ls`), re-attach (`tmux attach -t factory`), and clean up finished sessions (`tmux kill-session -t factory`).

## Core Vocabulary

| Term | Definition |
| --- | --- |
| **Multiplexer** | A persistent background terminal server running shells, windows, and panes independently of any desktop window or SSH connection. |
| **Prefix key** | The two-step attention chord (`Ctrl-b` by default) telling `tmux` the very next keypress controls the workspace instead of typing into the active shell. |
| **Pane** | A single live shell tiled inside a `tmux` window so multiple agents, commands, and test suites stay visible side by side. |
| **Detach / Attach** | Disconnecting your visual viewport (`Ctrl-b d`) while background jobs run uninterrupted, then reconnecting (`tmux attach -t <name>`) from any terminal window with live or completed output intact. |

## The Four-Tier Tmux Hierarchy

```text
01 · Tmux Server      Quiet background daemon keeping every shell alive
02 · Named Sessions   Project workspaces (e.g., factory, api)
03 · Windows          Full-screen tabs along the bottom status bar (0:bash, 1:logs)
04 · Split Panes      Side-by-side live terminals tiled inside one window
```

## Included Reference

- [`tmux-fundamentals-cheatsheet.md`](./tmux-fundamentals-cheatsheet.md) — Complete printable reference covering installation, session lifecycle, pane splitting/navigation/zoom, window management, detach/attach survival, and clean teardown.

## Hands-On Survival Drill (5 Minutes)

Run this exact sequence in your project directory (such as `/workspace/lab-cli`) to experience disconnect survival firsthand:

```bash
# 1. Verify tmux is installed (or install via apt / brew)
tmux -V

# 2. Launch a named session
tmux new -s factory
```

Inside `factory`:

1. Press `Ctrl-b` then `%` to split left and right; run `git status` in the right pane.
2. Press `Ctrl-b` then `"` to split the right pane vertically; run `npm test` in the bottom-right pane.
3. Navigate back to the tall left pane (`Ctrl-b` + `Left`) and toggle full-screen zoom twice (`Ctrl-b z` → notice `0:bash*Z` → `Ctrl-b z`).
4. Create a second window (`Ctrl-b c`), rename it to `logs` (`Ctrl-b ,` → clear `bash` → type `logs` → `Enter`), and start a live watcher:
   ```bash
   while true; do clear; date +%T; npm test; sleep 2; done
   ```
5. Switch back to Window `0` (`Ctrl-b 0`) and launch a read-only headless agent task in Pane `0`:
   ```bash
   agy -p "Print 3 concise one-line edge-case test ideas for src/calc.js directly in your reply as a numbered list. Do not create any files or plan artifacts." --mode plan
   ```
6. Detach mid-run with `Ctrl-b d` (confirm `[detached (from session factory)]`), then type `exit` to close the terminal window completely.
7. Open a brand-new terminal window and verify survival:
   ```bash
   tmux ls
   tmux attach -t factory
   ```
8. Inspect the completed output (`Ctrl-b z`), check Window `1` (`Ctrl-b 1`) to see the live timestamp still ticking, and when finished with the drill, end the session cleanly:
   ```bash
   tmux kill-session -t factory
   ```
