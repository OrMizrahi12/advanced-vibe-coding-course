# Lab Loops Progress Log
- Baseline (main): starter FIFO queue in src/queue.js (`npm test`: 2 pass, 0 fail).
- Invariants: pure Node ESM, zero external deps, preserve createQueue() API.
- US-01 (Priority ordering): shipped and verified.
- US-02 (Retry cap and dead-letter queue): shipped and verified.
- Backpressure gate: wired 4-layer fail-fast `npm run verify` (< 2s) in scripts/verify.sh.

## Shipped Stories
- (new verified Ralph iterations append below)
