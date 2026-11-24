export function calculateSubtotal(items) {
  return items.reduce((sum, i) => sum + Math.round(i.priceCents) * i.qty, 0);
}

export function applyDiscount(subtotalCents, coupon) {
  if (!coupon) return 0;
  if (coupon === "SAVE10") return Math.round(subtotalCents * 0.1);
  if (coupon === "FLAT500") return Math.min(subtotalCents, 500);
  return 0;
}

export function calculateInvoice(items, options = {}) {
  const { coupon = null, taxRate = 0.08 } = options;
  const subtotalCents = calculateSubtotal(items);
  const rawDiscount = applyDiscount(subtotalCents, coupon);
  const discountCents = Math.min(subtotalCents, rawDiscount);
  const taxableCents = subtotalCents - discountCents;
  const taxCents = Math.round(taxableCents * taxRate);
  const totalCents = taxableCents + taxCents;
  return { subtotalCents, discountCents, taxCents, totalCents };
}
