/**
 * Pure, reliable ledger balance calculation utilities
 * Follows strict double-entry principles for fund balance accounting.
 */

/**
 * Calculate expected balance for a fund given its opening balance and completed transactions
 * @param {number} openingBalance
 * @param {Array<Object>} transactions
 * @param {string|mongoose.Types.ObjectId} fundId
 * @returns {{ openingBalance: number, totalCredits: number, totalDebits: number, calculatedBalance: number, completedCount: number }}
 */
function calculateFundBalanceFromTransactions(openingBalance, transactions, fundId) {
  const fundIdStr = String(fundId);
  let totalCredits = 0;
  let totalDebits = 0;
  let completedCount = 0;

  for (const tx of transactions) {
    // Only completed transactions impact the actual financial balance
    if (tx.status !== 'Completed') {
      continue;
    }

    const txFundStr = String(tx.fund?._id || tx.fund);
    const destFundStr = tx.destinationFund ? String(tx.destinationFund?._id || tx.destinationFund) : null;
    const amount = Number(tx.amount) || 0;

    if (tx.transactionType === 'Transfer') {
      if (destFundStr === fundIdStr) {
        // Inward transfer to this fund
        totalCredits += amount;
        completedCount++;
      } else if (txFundStr === fundIdStr) {
        // Outward transfer from this fund
        totalDebits += amount;
        completedCount++;
      }
    } else if (txFundStr === fundIdStr) {
      completedCount++;
      if (tx.direction === 'Credit') {
        totalCredits += amount;
      } else if (tx.direction === 'Debit') {
        totalDebits += amount;
      }
    }
  }

  // Rounded to 2 decimal places to avoid floating point inaccuracies
  totalCredits = Math.round(totalCredits * 100) / 100;
  totalDebits = Math.round(totalDebits * 100) / 100;
  const calculatedBalance = Math.round((openingBalance + totalCredits - totalDebits) * 100) / 100;

  return {
    openingBalance,
    totalCredits,
    totalDebits,
    calculatedBalance,
    completedCount
  };
}

/**
 * Verifies if a Fund object's recorded balance strictly matches its transaction history
 * @param {Object} fund
 * @param {Array<Object>} transactions
 * @returns {{ isConsistent: boolean, recordedBalance: number, calculatedBalance: number, difference: number }}
 */
function verifyFundBalance(fund, transactions) {
  const calc = calculateFundBalanceFromTransactions(fund.openingBalance, transactions, fund._id);
  const recorded = Math.round(fund.currentBalance * 100) / 100;
  const difference = Math.round((recorded - calc.calculatedBalance) * 100) / 100;

  return {
    isConsistent: Math.abs(difference) < 0.01,
    recordedBalance: recorded,
    calculatedBalance: calc.calculatedBalance,
    difference,
    details: calc
  };
}

module.exports = {
  calculateFundBalanceFromTransactions,
  verifyFundBalance
};
