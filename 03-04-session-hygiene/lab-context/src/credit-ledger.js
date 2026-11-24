function assertNonNegativeInt(value, name) {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer`);
  }
}

export function applyStoreCredit(invoiceTotalCents, availableCreditCents) {
  assertNonNegativeInt(invoiceTotalCents, "invoiceTotalCents");
  assertNonNegativeInt(availableCreditCents, "availableCreditCents");
  const appliedCreditCents = Math.min(invoiceTotalCents, availableCreditCents);
  return {
    appliedCreditCents,
    remainingDueCents: Math.max(0, invoiceTotalCents - appliedCreditCents),
    unusedCreditCents: availableCreditCents - appliedCreditCents,
  };
}

export function allocateCreditGrants(invoiceTotalCents, grants, nowIso) {
  assertNonNegativeInt(invoiceTotalCents, "invoiceTotalCents");
  if (!Array.isArray(grants)) {
    throw new TypeError("grants must be an array");
  }
  if (typeof nowIso !== "string" || !nowIso.trim()) {
    throw new RangeError("nowIso must be a non-empty ISO date string");
  }
  const ordered = grants
    .map((grant, idx) => {
      assertNonNegativeInt(grant.remainingCents, `grants[${idx}].remainingCents`);
      return {
        id: grant.id,
        remainingCents: grant.remainingCents,
        expiresAt: grant.expiresAt,
        idx,
      };
    })
    .filter((g) => g.remainingCents > 0 && g.expiresAt >= nowIso)
    .sort((a, b) => a.expiresAt.localeCompare(b.expiresAt) || a.idx - b.idx);

  let remainingDueCents = invoiceTotalCents;
  let appliedCreditCents = 0;
  const allocations = [];

  for (const grant of ordered) {
    if (remainingDueCents === 0) break;
    const usedCents = Math.min(remainingDueCents, grant.remainingCents);
    appliedCreditCents += usedCents;
    remainingDueCents -= usedCents;
    allocations.push({ id: grant.id, usedCents });
  }

  return { appliedCreditCents, remainingDueCents, allocations };
}
