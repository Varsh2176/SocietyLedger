const { Transaction, Fund } = require('../models');
const {
  TRANSACTION_STATUS,
  TRANSACTION_TYPES,
  PAYMENT_METHODS,
} = require('../config/constants');
const { rupeesToPaise, paiseToRupees } = require('../utils/money');
const { recalculateFundBalance } = require('./fundService');
const { logAction } = require('./auditService');

/**
 * Retrieves paginated and filtered transactions matching the frontend API contract.
 */
const getTransactions = async (societyId, params = {}) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    type = 'ALL',
    fund = 'ALL',
    status = 'ALL',
    startDate = '',
    endDate = '',
    sortKey = 'date',
    sortOrder = 'desc',
  } = params;

  const query = { societyId };

  if (type && type !== 'ALL') {
    query.type = type;
  }

  if (fund && fund !== 'ALL') {
    query.$or = [{ fund: fund }, { fundCode: fund }];
  }

  if (status && status !== 'ALL') {
    query.status = status;
  }

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (search && search.trim()) {
    const q = search.trim();
    const searchFilter = [
      { description: { $regex: q, $options: 'i' } },
      { reference: { $regex: q, $options: 'i' } },
      { category: { $regex: q, $options: 'i' } },
      { vendorName: { $regex: q, $options: 'i' } },
    ];
    if (query.$or) {
      query.$and = [{ $or: query.$or }, { $or: searchFilter }];
      delete query.$or;
    } else {
      query.$or = searchFilter;
    }
  }

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortOptions = {};
  if (sortKey === 'amount') {
    sortOptions.amountInPaise = sortDirection;
  } else {
    sortOptions[sortKey] = sortDirection;
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const [transactions, total] = await Promise.all([
    Transaction.find(query).sort(sortOptions).skip(skip).limit(limitNum),
    Transaction.countDocuments(query),
  ]);

  return {
    transactions,
    total,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * Retrieves a single transaction by ID or Reference
 */
const getTransactionById = async (societyId, idOrRef) => {
  let transaction = null;
  if (idOrRef.match(/^[0-9a-fA-F]{24}$/)) {
    transaction = await Transaction.findOne({ _id: idOrRef, societyId });
  }
  if (!transaction) {
    transaction = await Transaction.findOne({ reference: idOrRef, societyId });
  }

  if (!transaction) {
    const error = new Error('Transaction record not found.');
    error.statusCode = 404;
    throw error;
  }

  return transaction;
};

/**
 * Creates a new financial transaction voucher (Treasurer / Admin)
 */
const createTransaction = async (societyId, voucherData, user) => {
  const {
    reference,
    date,
    type,
    fund,
    fundCode,
    category,
    description,
    amount,
    paymentMethod = PAYMENT_METHODS.NEFT_RTGS,
    vendorName,
    invoiceNumber,
    status = TRANSACTION_STATUS.PENDING,
    toFund,
    toFundCode,
    expenseRequestId,
    eventId,
  } = voucherData;

  // Validation
  if (!type || !fund || !category || !description || amount === undefined) {
    const error = new Error('Transaction type, fund, category, description, and amount are required.');
    error.statusCode = 400;
    throw error;
  }

  const amountNum = Number(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    const error = new Error('Transaction amount must be a positive number.');
    error.statusCode = 400;
    throw error;
  }

  const amountPaise = rupeesToPaise(amountNum);

  // Generate reference if not supplied
  const voucherRef = reference?.trim() || `VR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  // Check unique reference
  const existingRef = await Transaction.findOne({ societyId, reference: voucherRef });
  if (existingRef) {
    const error = new Error(`Transaction reference '${voucherRef}' already exists.`);
    error.statusCode = 409;
    throw error;
  }

  // Look up source fund
  let fundDoc = null;
  if (fundCode) {
    fundDoc = await Fund.findOne({ societyId, code: fundCode.trim().toUpperCase() });
  }
  if (!fundDoc) {
    fundDoc = await Fund.findOne({ societyId, name: fund.trim() });
  }

  // Look up destination fund for TRANSFER
  let toFundDoc = null;
  if (type === TRANSACTION_TYPES.TRANSFER) {
    if (!toFund && !toFundCode) {
      const error = new Error('Destination fund is required for internal fund transfers.');
      error.statusCode = 400;
      throw error;
    }
    if (toFundCode) {
      toFundDoc = await Fund.findOne({ societyId, code: toFundCode.trim().toUpperCase() });
    }
    if (!toFundDoc && toFund) {
      toFundDoc = await Fund.findOne({ societyId, name: toFund.trim() });
    }
  }

  const transaction = await Transaction.create({
    societyId,
    reference: voucherRef,
    date: date ? new Date(date) : new Date(),
    type,
    fund: fundDoc ? fundDoc.name : fund.trim(),
    fundCode: fundDoc ? fundDoc.code : (fundCode ? fundCode.trim().toUpperCase() : ''),
    fundId: fundDoc ? fundDoc._id : null,
    toFund: toFundDoc ? toFundDoc.name : (toFund ? toFund.trim() : null),
    toFundCode: toFundDoc ? toFundDoc.code : (toFundCode ? toFundCode.trim().toUpperCase() : null),
    toFundId: toFundDoc ? toFundDoc._id : null,
    category: category.trim(),
    description: description.trim(),
    amount: amountNum,
    amountInPaise: amountPaise,
    paymentMethod,
    vendorName: vendorName ? vendorName.trim() : null,
    invoiceNumber: invoiceNumber ? invoiceNumber.trim() : null,
    status,
    expenseRequestId: expenseRequestId || null,
    eventId: eventId || null,
    createdBy: user ? user._id : null,
  });

  // Re-synchronize balances if posted/active status
  if ([TRANSACTION_STATUS.PAID, TRANSACTION_STATUS.RECONCILED, TRANSACTION_STATUS.APPROVED].includes(status)) {
    if (fundDoc) await recalculateFundBalance(societyId, fundDoc._id);
    if (toFundDoc) await recalculateFundBalance(societyId, toFundDoc._id);
  }

  await logAction({
    societyId,
    actor: user ? `${user.name} (${user.role})` : 'Authorized Officer',
    actorId: user ? user._id : null,
    action: 'CREATE_TRANSACTION',
    entityType: 'TRANSACTION',
    entityRef: transaction.reference,
    details: `Created ${type} voucher ${transaction.reference} for ₹ ${amountNum} (${category}) with status ${status}.`,
  });

  return transaction;
};

/**
 * Audited Reversal Workflow
 * Finalized financial transactions are never deleted; they are reversed with mandatory justification.
 */
const reverseTransaction = async (societyId, idOrRef, justification, user) => {
  if (!justification || justification.trim().length < 5) {
    const error = new Error('Mandatory reversal justification required (minimum 5 characters).');
    error.statusCode = 400;
    throw error;
  }

  const transaction = await getTransactionById(societyId, idOrRef);

  if (transaction.status === TRANSACTION_STATUS.REVERSED) {
    const error = new Error('This transaction voucher has already been reversed.');
    error.statusCode = 400;
    throw error;
  }

  const prevStatus = transaction.status;
  transaction.status = TRANSACTION_STATUS.REVERSED;
  transaction.reversalReason = justification.trim();
  transaction.reversedAt = new Date();
  transaction.reversedBy = user ? user._id : null;

  await transaction.save();

  // Recalculate fund balances to remove the reversed voucher's financial impact
  if (transaction.fundId) {
    await recalculateFundBalance(societyId, transaction.fundId);
  }
  if (transaction.toFundId) {
    await recalculateFundBalance(societyId, transaction.toFundId);
  }

  await logAction({
    societyId,
    actor: user ? `${user.name} (${user.role})` : 'Authorized Officer',
    actorId: user ? user._id : null,
    action: 'REVERSE_TRANSACTION',
    entityType: 'TRANSACTION',
    entityRef: transaction.reference,
    details: `Reversed voucher ${transaction.reference} (Amount: ₹ ${transaction.amount}, Prev Status: ${prevStatus}). Justification: ${justification.trim()}`,
  });

  return transaction;
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  reverseTransaction,
};
