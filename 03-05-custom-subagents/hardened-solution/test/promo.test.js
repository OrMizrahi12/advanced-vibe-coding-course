import test from "node:test";
import assert from "node:assert/strict";
import { evaluatePromoRule, matchPromoCode } from "../backend/promo-evaluator.js";
import { renderPromoBanner } from "../frontend/promo-preview.js";

test("evaluatePromoRule rejects code injection payloads and invalid regex patterns safely", () => {
  const injected = evaluatePromoRule(5000, "process.exit(1)");
  assert.equal(injected.ok, false);
  assert.equal(injected.data, null);
  assert.equal(injected.error.code, "UNKNOWN_RULE");

  const valid = evaluatePromoRule(12000, "VIP_25");
  assert.deepEqual(valid, { ok: true, data: { discountCents: 3000 }, error: null });

  const redos = matchPromoCode("VIP25", "(a+)+$");
  assert.equal(redos.ok, false);
  assert.equal(redos.error.code, "UNSAFE_PATTERN");

  const matched = matchPromoCode("vip_2026", "VIP");
  assert.deepEqual(matched, {
    ok: true,
    data: { matched: true, normalized: "VIP_2026", label: "VIP_2026" },
    error: null,
  });
});

test("renderPromoBanner escapes script tags and untrusted HTML attributes", () => {
  const html = renderPromoBanner(
    '<script>alert("xss")</script>',
    "50% & <b>Off</b>",
    1500
  );
  assert.equal(html.includes("<script>"), false);
  assert.equal(html.includes("<b>"), false);
  assert.equal(html.includes("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"), true);
  assert.equal(html.includes("50% &amp; &lt;b&gt;Off&lt;/b&gt;"), true);
  assert.equal(html.includes('data-testid="promo"'), true);
});
