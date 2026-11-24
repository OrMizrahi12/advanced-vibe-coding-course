import { calculateInvoice } from "../src/invoice.js";

export function buildInvoiceSummary(items, couponCode = null, taxRate = 0.08) {
  const result = calculateInvoice(items, { coupon: couponCode, taxRate });
  return { ok: true, data: result, error: null };
}
