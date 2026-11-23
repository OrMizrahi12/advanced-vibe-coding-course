/**
 * Adds two numbers.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function add(a, b) {
  return a + b;
}

/**
 * Subtracts the second number from the first.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function subtract(a, b) {
  return a - b;
}

/**
 * Multiplies two numbers.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function multiply(a, b) {
  return a * b;
}

/**
 * Divides a by b.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 * @throws {Error} When b is zero.
 */
export function divide(a, b) {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}

/**
 * Calculates a percentage of a value.
 * @param {number} value
 * @param {number} pct
 * @returns {number}
 * @throws {Error} When either input is not a finite number.
 */
export function percentage(value, pct) {
  if (!Number.isFinite(value) || !Number.isFinite(pct)) {
    throw new Error("Inputs must be finite numbers");
  }
  return (value * pct) / 100;
}

/**
 * Clamps a numeric value within [min, max].
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 * @throws {Error} When inputs are not finite or min exceeds max.
 */
export function clamp(value, min, max) {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) {
    throw new Error("Inputs must be finite numbers");
  }
  if (min > max) {
    throw new Error("min cannot exceed max");
  }
  return Math.min(Math.max(value, min), max);
}

/**
 * Rounds a number to the specified number of decimal places.
 * @param {number} value
 * @param {number} [decimals=2]
 * @returns {number}
 */
export function roundTo(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
