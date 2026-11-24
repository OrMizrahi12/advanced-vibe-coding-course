const HTML_ESCAPE = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => HTML_ESCAPE[ch]);
}

export function renderPromoBanner(customerName, promoLabel, cents) {
  const safeCents = Number.isFinite(cents) ? Math.max(0, Math.round(cents)) : 0;
  const dollars = (safeCents / 100).toFixed(2);
  const safeUser = escapeHtml(customerName);
  const safeOffer = escapeHtml(promoLabel);
  const heading = "Promo preview";
  return [
    `<section class="sp-promo" aria-label="${heading}" data-testid="promo">`,
    `  <p class="sp-user" data-testid="user">Welcome, ${safeUser}</p>`,
    `  <p class="sp-offer" data-testid="offer">Offer: ${safeOffer}</p>`,
    `  <p class="sp-save" data-testid="save">Savings: -$${dollars}</p>`,
    `</section>`,
  ].join("\n");
}

export const PROMO_BANNER_VERSION = "1.0.0";
