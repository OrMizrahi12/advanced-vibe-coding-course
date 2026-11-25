---
name: verify-ui
description: Verify UI changes in headless Chromium before finishing frontend work.
---
# Browser Verification Gate
1. Run `npm test` to confirm unit logic passes.
2. Run `npm run verify:ui` (`node scripts/verify-ui.mjs`) in headless Chromium.
3. Require exit `0`, zero `console.error`, zero `pageerror`, and zero HTTP 4xx/5xx.
4. Assert rendered DOM updates (`42 -> 43`) before declaring UI work complete.
5. Inspect `verify-board.png` on UI changes; never commit while `verify:ui` fails.
6. Confirm zero orphan `server.mjs` processes remain after teardown.
