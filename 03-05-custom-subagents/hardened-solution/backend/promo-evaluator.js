const PRESET_RULES = Object.freeze({
  TEN_PCT: (subtotalCents) => Math.round(subtotalCents * 0.1),
  FLAT_500: (subtotalCents) => Math.min(subtotalCents, 500),
  VIP_25: (subtotalCents) =>
    subtotalCents >= 10000 ? Math.min(Math.round(subtotalCents * 0.25), 5000) : 0,
});

const MAX_PATTERN_LEN = 32;
const SAFE_CODE_RE = /^[A-Z0-9_-]{1,32}$/;

function fail(code, message) {
  return { ok: false, data: null, error: { code, message } };
}

export function evaluatePromoRule(subtotalCents, ruleName) {
  if (!Number.isInteger(subtotalCents) || subtotalCents < 0) {
    return fail("BAD_SUBTOTAL", "Non-negative integer cents required");
  }
  if (typeof ruleName !== "string" || !Object.hasOwn(PRESET_RULES, ruleName)) {
    return fail("UNKNOWN_RULE", "Rule must be an allowlisted preset");
  }
  const discountCents = Math.max(0, Math.min(subtotalCents, PRESET_RULES[ruleName](subtotalCents)));
  return { ok: true, data: { discountCents }, error: null };
}

export function matchPromoCode(code, prefix) {
  if (typeof code !== "string" || !code.trim()) {
    return fail("BAD_CODE", "Non-empty promo code string required");
  }
  if (typeof prefix !== "string" || !prefix.trim() || prefix.trim().length > MAX_PATTERN_LEN) {
    return fail("BAD_PATTERN", "Promo prefix must be 1-32 characters");
  }
  const normalized = code.trim().toUpperCase();
  const cleanPrefix = prefix.trim().toUpperCase();
  if (!SAFE_CODE_RE.test(cleanPrefix)) {
    return fail("UNSAFE_PATTERN", "Promo prefix accepts only A-Z, 0-9, _, and -");
  }
  const matched = normalized.startsWith(cleanPrefix);
  return {
    ok: true,
    data: { matched, normalized, label: matched ? normalized : "NONE" },
    error: null,
  };
}
