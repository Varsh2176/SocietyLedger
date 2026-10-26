const { ExpenseRequest, Fund } = require('../models');
const { APPROVAL_STATUS } = require('../config/constants');
const { rupeesToPaise } = require('../utils/money');
const { logAction } = require('./auditService');

/**
 * Retrieves expense requests for approval with filtering matching frontend
 */
const getApprovals = async (societyId, params = {}) => {
  const { status, search } = params;
  const query = { societyId };

  if (status && status !== 'ALL') {
    query.status = status;
  }

  if (search && search.trim()) {
    const q = search.trim();
    query.$or = [
      { description: { $regex: q, $options: 'i' } },
      { requesterName: { $regex: q, $options: 'i' } },
      { vendorName: { $regex: q, $options: 'i' } },
      { quotationRef: { $regex: q, $options: 'i' } },
      { invoiceNumber: { $regex: q, $options: 'i' } },
    ];
  }

  const approvals = await ExpenseRequest.find(query).sort({ submissionDate: -1, createdAt: -1 });
  return approvals;
};

/**
 * Retrieves a single approval request by ID
 */
const getApprovalById = async (societyId, id) => {
  const approval = await ExpenseRequest.findOne({ _id: id, societyId });
  if (!approval) {
    const error = new Error('Expense approval record not found.');
    error.statusCode = 404;
    throw error;
  }
  return approval;
};

/**
 * Creates a new expense request
 */
const createExpenseRequest = async (societyId, data, user) => {
  const {
    description,
    requestedAmount,
    fund,
    fundCode,
    relatedEvent,
    eventId,
    vendorName,
    quotationRef,
    invoiceNumber,
    notes,
  } = data;

  if (!description || requestedAmount === undefined) {
    const error = new Error('Description and requested amount are required.');
    error.statusCode = 400;
    throw error;
  }

  const amountNum = Number(requestedAmount);
  if (isNaN(amountNum) || amountNum <= 0) {
    const error = new Error('Requested amount must be a positive number.');
    error.statusCode = 400;
    throw error;
  }

  // Lookup fund if code/name given
  let fundDoc = null;
  if (fundCode) {
    fundDoc = await Fund.findOne({ societyId, code: fundCode.trim().toUpperCase() });
  }
  if (!fundDoc && fund) {
    fundDoc = await Fund.findOne({ societyId, name: fund.trim() });
  }

  const expense = await ExpenseRequest.create({
    societyId,
    description: description.trim(),
    requestedAmount: amountNum,
    requestedAmountInPaise: rupeesToPaise(amountNum),
    fund: fundDoc ? fundDoc.name : (fund ? fund.trim() : 'Monthly Maintenance & Operational Account'),
    fundCode: fundDoc ? fundDoc.code : (fundCode ? fundCode.trim().toUpperCase() : 'FND-MAINT'),
    fundId: fundDoc ? fundDoc._id : null,
    relatedEvent: relatedEvent ? relatedEvent.trim() : null,
    eventId: eventId || null,
    vendorName: vendorName ? vendorName.trim() : null,
    quotationRef: quotationRef ? quotationRef.trim() : null,
    invoiceNumber: invoiceNumber ? invoiceNumber.trim() : null,
    requesterId: user ? user._id : null,
    requesterName: user ? user.name : 'Authorized Member',
    requesterEmail: user ? user.email.toLowerCase() : 'requester@society.org',
    submissionDate: new Date(),
    status: APPROVAL_STATUS.PENDING,
    notes: notes ? notes.trim() : '',
    decisionHistory: [],
  });

  await logAction({
    societyId,
    actor: user ? `${user.name} (${user.role})` : 'Requester',
    actorId: user ? user._id : null,
    action: 'CREATE_EXPENSE_REQUEST',
    entityType: 'APPROVAL',
    entityRef: expense._id.toString(),
    details: `Submitted expense request for ₹ ${amountNum} ('${description}').`,
  });

  return expense;
};

/**
 * Registers an approval, rejection, or request for more information.
 * Enforces separation-of-duties: requesters CANNOT self-approve their own expense requests!
 */
const decideApproval = async (societyId, id, { action, comments }, user) => {
  if (!action || !Object.values(APPROVAL_STATUS).includes(action)) {
    const error = new Error(`Invalid action '${action}'. Allowed: ${Object.values(APPROVAL_STATUS).join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const approval = await getApprovalById(societyId, id);

  // Separation-of-Duties Security Rule
  if (user && approval.requesterEmail && user.email.toLowerCase() === approval.requesterEmail.toLowerCase()) {
    const error = new Error('Separation-of-Duties Violation: Requesters are strictly prohibited from self-approving their own expense requests.');
    error.statusCode = 403;
    throw error;
  }

  // Also check requesterId if present
  if (user && approval.requesterId && user._id && approval.requesterId.toString() === user._id.toString()) {
    const error = new Error('Separation-of-Duties Violation: Requesters are strictly prohibited from self-approving their own expense requests.');
    error.statusCode = 403;
    throw error;
  }

  approval.status = action;
  const deciderName = user?.name ? `${user.name} (${user.role || 'Committee'})` : 'Authorized Signatory';

  approval.decisionHistory.unshift({
    action,
    decidedBy: deciderName,
    decidedById: user ? user._id : null,
    date: new Date(),
    comments: comments?.trim() || `Decision registered as ${action}.`,
  });

  await approval.save();

  await logAction({
    societyId,
    actor: deciderName,
    actorId: user ? user._id : null,
    action: action === APPROVAL_STATUS.APPROVED ? 'APPROVE_EXPENSE' : (action === APPROVAL_STATUS.REJECTED ? 'REJECT_EXPENSE' : 'REQUEST_INFO'),
    entityType: 'APPROVAL',
    entityRef: approval.description,
    details: `Expense request of ₹ ${approval.requestedAmount} updated to status '${action}'. Comments: ${comments || 'None'}`,
  });

  return approval;
};

module.exports = {
  getApprovals,
  getApprovalById,
  createExpenseRequest,
  decideApproval,
};
