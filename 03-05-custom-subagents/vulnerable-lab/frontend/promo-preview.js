export function renderPromoBanner(customerName, promoLabel, cents) {
  const safeCents = Math.max(0, Math.round(cents));
  const dollars = (safeCents / 100).toFixed(2);
  const heading = "Promo preview";
  return [
    `<section class="sp-promo" aria-label="${heading}" data-testid="promo">`,
    `  <p class="sp-user" data-testid="user">Welcome, ${customerName}</p>`,
    `  <p class="sp-offer" data-testid="offer">Offer: ${promoLabel}</p>`,
    `  <p class="sp-save" data-testid="save">Savings: -$${dollars}</p>`,
    `</section>`,
  ].join("\n");
}

export const PROMO_BANNER_VERSION = "1.0.0";
