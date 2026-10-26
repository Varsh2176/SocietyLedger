/**
 * SocietyLedger Monetary Utilities
 * Enforces integer paise storage for exact precision without floating point errors.
 * 1 Rupee = 100 Paise (e.g. ₹18,500 = 1,850,000 paise)
 */

/**
 * Converts Rupees to integer Paise
 * @param {number|string} rupees
 * @returns {number} Integer paise
 */
const rupeesToPaise = (rupees) => {
  if (rupees === undefined || rupees === null || isNaN(rupees)) {
    return 0;
  }
  return Math.round(Number(rupees) * 100);
};

/**
 * Converts Paise to Rupees (decimal)
 * @param {number|string} paise
 * @returns {number} Rupees
 */
const paiseToRupees = (paise) => {
  if (paise === undefined || paise === null || isNaN(paise)) {
    return 0;
  }
  return Number(paise) / 100;
};

/**
 * Formats Rupees into Indian currency notation (e.g. ₹ 1,47,000)
 * @param {number|string} rupees
 * @returns {string}
 */
const formatINR = (rupees) => {
  const val = Number(rupees) || 0;
  return `₹ ${new Intl.NumberFormat('en-IN').format(val)}`;
};

module.exports = {
  rupeesToPaise,
  paiseToRupees,
  formatINR,
};
