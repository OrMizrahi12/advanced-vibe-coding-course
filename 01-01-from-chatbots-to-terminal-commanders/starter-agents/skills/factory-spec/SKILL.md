---
name: factory-spec
description: Partition a feature spec into isolated verified worktree branches.
---
# Factory Spec Workflow
1. Split the spec into independent API, UI, and E2E workstreams.
2. Provision isolated git worktrees (wt-api, wt-ui, wt-tests).
3. Enforce backpressure with test:api, test:ui, and test:e2e.
4. Merge branches to main only after every suite flips green.
