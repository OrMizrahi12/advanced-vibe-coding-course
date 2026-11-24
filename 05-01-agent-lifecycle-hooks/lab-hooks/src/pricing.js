/**
 * @param {number} priceCents
 * @param {number} pct
 * @returns {number}
 */
export function applyDiscount(priceCents, pct) {
  if (priceCents < 0 || pct < 0 || pct > 100) {
    throw new RangeError("invalid price or discount");
  }
  return Math.round(priceCents * (100 - pct) / 100);
}

/** @param {number} cents */
export function formatUsd(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}
