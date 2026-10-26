const { Reconciliation } = require('../models');
const { logAction } = require('./auditService');

/**
 * Retrieves bank reconciliations for a society
 */
const getReconciliations = async (societyId) => {
  const reconciliations = await Reconciliation.find({ societyId }).sort({ createdAt: -1 });
  return reconciliations;
};

/**
 * Retrieves a single reconciliation record by ID
 */
const getReconciliationById = async (societyId, id) => {
  const reconciliation = await Reconciliation.findOne({ _id: id, societyId });
  if (!reconciliation) {
    const error = new Error('Reconciliation record not found.');
    error.statusCode = 404;
    throw error;
  }
  return reconciliation;
};

/**
 * Executes reconciliation verification against bank statement balances.
 * Security rule: If there is an unresolved difference (> ₹0), cannot be stamped as RECONCILED.
 */
const verifyReconciliation = async (societyId, id, user) => {
  const item = await getReconciliationById(societyId, id);

  if (item.differenceAmount !== 0) {
    const error = new Error(`Cannot finalize reconciliation: Unresolved difference of ₹ ${item.differenceAmount} detected against bank statement.`);
    error.statusCode = 400;
    throw error;
  }

  item.status = 'RECONCILED';
  item.reconciledAt = new Date();
  item.reviewedBy = user ? `${user.name} (${user.role})` : 'Suresh Menon (Auditor)';

  await item.save();

  await logAction({
    societyId,
    actor: item.reviewedBy,
    actorId: user ? user._id : null,
    action: 'RECONCILE_TRANSACTION',
    entityType: 'RECONCILIATION',
    entityRef: item.accountName,
    details: `Successfully verified and reconciled bank balance (₹ ${item.bookClosingBalance}) for account ${item.accountName}. Zero discrepancy confirmed.`,
  });

  return item;
};

module.exports = {
  getReconciliations,
  getReconciliationById,
  verifyReconciliation,
};
