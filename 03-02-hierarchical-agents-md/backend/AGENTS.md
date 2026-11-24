# Backend Rules (backend/)

## Response Envelope
- Every handler MUST return a structured JSON envelope:
  - Success: `{ ok: true, data: <payload>, error: null }`
  - Failure: `{ ok: false, data: null, error: { code, message } }`
- Never throw raw errors or return bare strings.

## Implementation Constraints
- Export pure functions only; zero mutable module state.
- Never mutate input arguments; return new objects.
- Validate required numeric inputs before computing.
