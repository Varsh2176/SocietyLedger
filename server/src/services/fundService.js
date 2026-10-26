const { Fund, Transaction } = require('../models');
const { FUND_TYPES, TRANSACTION_STATUS, TRANSACTION_TYPES } = require('../config/constants');
const { rupeesToPaise, paiseToRupees } = require('../utils/money');
const { logAction } = require('./auditService');

/**
 * Retrieves funds for a society with optional keyword search and type filter.
 */
const getFunds = async (societyId, params = {}) => {
  const { search, type } = params;
  const query = { societyId };

  if (type && type !== 'ALL') {
    query.type = type;
  }

  if (search) {
    const q = search.trim();
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { code: { $regex: q, $options: 'i' } },
      { purpose: { $regex: q, $options: 'i' } },
    ];
  }

  const funds = await Fund.find(query).sort({ type: 1, name: 1 });
  return funds;
};

/**
 * Retrieves a single fund by ID or Code
 */
const getFundById = async (societyId, idOrCode) => {
  let fund = null;
  if (idOrCode.match(/^[0-9a-fA-F]{24}$/)) {
    fund = await Fund.findOne({ _id: idOrCode, societyId });
  }
  if (!fund) {
    fund = await Fund.findOne({ code: idOrCode.toUpperCase(), societyId });
  }

  if (!fund) {
    const error = new Error('Fund record not found.');
    error.statusCode = 404;
    throw error;
  }

  return fund;
};

/**
 * Creates a new fund (Admin / Treasurer)
 */
const createFund = async (societyId, data, user) => {
  const {
    name,
    code,
    type,
    openingBalance = 0,
    restrictedUse = false,
    purpose,
    fiscalYear = 'FY 2026-27',
    bankAccount,
  } = data;

  if (!name || !code || !type) {
    const error = new Error('Fund name, code, and type are mandatory.');
    error.statusCode = 400;
    throw error;
  }

  if (!Object.values(FUND_TYPES).includes(type)) {
    const error = new Error(`Invalid fund type '${type}'. Permitted: ${Object.values(FUND_TYPES).join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const normalizedCode = code.trim().toUpperCase();

  const existing = await Fund.findOne({ societyId, code: normalizedCode });
  if (existing) {
    const error = new Error(`A fund with code '${normalizedCode}' already exists in this society.`);
    error.statusCode = 409;
    throw error;
  }

  const openingBalNum = Number(openingBalance) || 0;
  const openingPaise = rupeesToPaise(openingBalNum);

  const fund = await Fund.create({
    societyId,
    name: name.trim(),
    code: normalizedCode,
    type,
    openingBalance: openingBalNum,
    openingBalanceInPaise: openingPaise,
    currentBalance: openingBalNum,
    currentBalanceInPaise: openingPaise,
    restrictedUse: Boolean(restrictedUse),
    purpose: purpose ? purpose.trim() : '',
    fiscalYear: fiscalYear.trim(),
    bankAccount: bankAccount ? bankAccount.trim() : '',
    status: 'ACTIVE',
  });

  await logAction({
    societyId,
    actor: user ? `${user.name} (${user.role})` : 'Authorized Officer',
    actorId: user ? user._id : null,
    action: 'CREATE_FUND',
    entityType: 'FUND',
    entityRef: fund.code,
    details: `Created fund '${fund.name}' (${fund.code}) of type ${fund.type} with opening balance ₹ ${openingBalNum}.`,
  });

  return fund;
};

/**
 * Updates permitted fund metadata (Admin / Treasurer)
 */
const updateFund = async (societyId, id, updateData, user) => {
  const fund = await getFundById(societyId, id);

  if (updateData.name) fund.name = updateData.name.trim();
  if (updateData.purpose !== undefined) fund.purpose = updateData.purpose.trim();
  if (updateData.bankAccount !== undefined) fund.bankAccount = updateData.bankAccount.trim();
  if (updateData.restrictedUse !== undefined) fund.restrictedUse = Boolean(updateData.restrictedUse);
  if (updateData.status) fund.status = updateData.status;

  await fund.save();

  await logAction({
    societyId,
    actor: user ? `${user.name} (${user.role})` : 'Authorized Officer',
    actorId: user ? user._id : null,
    action: 'UPDATE_FUND',
    entityType: 'FUND',
    entityRef: fund.code,
    details: `Updated fund parameters for '${fund.name}' (${fund.code}).`,
  });

  return fund;
};

/**
 * Recalculates fund balance directly from posted ledger transactions.
 * Enforces financial integrity: current balance must equal opening balance + posted credits - posted debits.
 */
const recalculateFundBalance = async (societyId, fundId) => {
  const fund = await Fund.findOne({ _id: fundId, societyId });
  if (!fund) return null;

  // Active non-reversed posted transaction statuses that affect balance
  const activeStatuses = [
    TRANSACTION_STATUS.PAID,
    TRANSACTION_STATUS.RECONCILED,
    TRANSACTION_STATUS.APPROVED,
  ];

  // Calculate credits to this fund (INCOME or TRANSFER into this fund)
  const incoming = await Transaction.aggregate([
    {
      $match: {
        societyId: fund.societyId,
        status: { $in: activeStatuses },
        $or: [
          { fundId: fund._id, type: TRANSACTION_TYPES.INCOME },
          { toFundId: fund._id, type: TRANSACTION_TYPES.TRANSFER },
        ],
      },
    },
    {
      $group: {
        _id: null,
        totalCreditsInPaise: { $sum: '$amountInPaise' },
      },
    },
  ]);

  // Calculate debits from this fund (EXPENSE or TRANSFER out of this fund)
  const outgoing = await Transaction.aggregate([
    {
      $match: {
        societyId: fund.societyId,
        status: { $in: activeStatuses },
        $or: [
          { fundId: fund._id, type: TRANSACTION_TYPES.EXPENSE },
          { fundId: fund._id, type: TRANSACTION_TYPES.TRANSFER },
        ],
      },
    },
    {
      $group: {
        _id: null,
        totalDebitsInPaise: { $sum: '$amountInPaise' },
      },
    },
  ]);

  const totalCreditsInPaise = incoming[0]?.totalCreditsInPaise || 0;
  const totalDebitsInPaise = outgoing[0]?.totalDebitsInPaise || 0;

  const currentBalanceInPaise = fund.openingBalanceInPaise + totalCreditsInPaise - totalDebitsInPaise;
  fund.currentBalanceInPaise = currentBalanceInPaise;
  fund.currentBalance = paiseToRupees(currentBalanceInPaise);

  await fund.save();
  return fund;
};

module.exports = {
  getFunds,
  getFundById,
  createFund,
  updateFund,
  recalculateFundBalance,
};
