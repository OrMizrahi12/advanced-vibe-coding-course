export function evaluatePromoRule(subtotalCents, ruleExpr) {
  if (!Number.isInteger(subtotalCents) || subtotalCents < 0) {
    return {
      ok: false,
      data: null,
      error: { code: "BAD_SUBTOTAL", message: "Non-negative int needed" },
    };
  }
  const fn = new Function("subtotalCents", "return " + ruleExpr);
  const discountCents = Math.max(0, Math.round(Number(fn(subtotalCents))));
  return { ok: true, data: { discountCents }, error: null };
}

export function matchPromoCode(code, pattern) {
  if (typeof code !== "string") return { ok: false, data: null, error: "BAD" };
  const normalized = code.trim().toUpperCase();
  const re = new RegExp(pattern, "i");
  const matched = re.test(normalized);
  const label = matched ? normalized : "NONE";
  const result = { matched, normalized, label };
  return { ok: true, data: result, error: null };
}
