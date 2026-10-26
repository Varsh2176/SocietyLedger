const { Compliance } = require('../models');
const { COMPLIANCE_STATUS } = require('../config/constants');
const { logAction } = require('./auditService');

/**
 * Retrieves compliance filings for a society with optional status filter.
 */
const getFilings = async (societyId, params = {}) => {
  const { status, search } = params;
  const query = { societyId };

  if (status && status !== 'ALL') {
    query.status = status;
  }

  if (search && search.trim()) {
    const q = search.trim();
    query.$or = [
      { filingType: { $regex: q, $options: 'i' } },
      { statutoryBody: { $regex: q, $options: 'i' } },
      { responsiblePerson: { $regex: q, $options: 'i' } },
      { acknowledgementRef: { $regex: q, $options: 'i' } },
    ];
  }

  const filings = await Compliance.find(query).sort({ deadline: 1 });
  return filings;
};

/**
 * Retrieves single compliance filing by ID
 */
const getFilingById = async (societyId, id) => {
  const filing = await Compliance.findOne({ _id: id, societyId });
  if (!filing) {
    const error = new Error('Compliance filing record not found.');
    error.statusCode = 404;
    throw error;
  }
  return filing;
};

/**
 * Creates a compliance filing requirement
 */
const createFiling = async (societyId, data, user) => {
  const {
    filingType,
    statutoryBody,
    financialPeriod,
    deadline,
    responsiblePerson,
    notes,
  } = data;

  if (!filingType || !statutoryBody || !financialPeriod || !deadline) {
    const error = new Error('Filing type, statutory body, financial period, and deadline are required.');
    error.statusCode = 400;
    throw error;
  }

  const filing = await Compliance.create({
    societyId,
    filingType: filingType.trim(),
    statutoryBody: statutoryBody.trim(),
    financialPeriod: financialPeriod.trim(),
    deadline: new Date(deadline),
    responsiblePerson: responsiblePerson ? responsiblePerson.trim() : 'Management Committee',
    status: COMPLIANCE_STATUS.PENDING,
    notes: notes ? notes.trim() : '',
  });

  await logAction({
    societyId,
    actor: user ? `${user.name} (${user.role})` : 'Authorized Officer',
    actorId: user ? user._id : null,
    action: 'CREATE_COMPLIANCE_RECORD',
    entityType: 'COMPLIANCE',
    entityRef: filing.filingType,
    details: `Created compliance requirement '${filing.filingType}' due on ${filing.deadline.toISOString().split('T')[0]}.`,
  });

  return filing;
};

/**
 * Records completion of a compliance filing with government acknowledgement reference
 */
const recordFiling = async (societyId, id, updateData, user) => {
  const filing = await getFilingById(societyId, id);

  filing.status = updateData.status || COMPLIANCE_STATUS.FILED;
  if (updateData.acknowledgementRef) filing.acknowledgementRef = updateData.acknowledgementRef.trim();
  if (updateData.submissionDate) filing.submissionDate = new Date(updateData.submissionDate);
  else filing.submissionDate = new Date();
  if (updateData.notes !== undefined) filing.notes = updateData.notes.trim();
  if (updateData.supportingDocument) filing.supportingDocument = updateData.supportingDocument.trim();

  await filing.save();

  await logAction({
    societyId,
    actor: user ? `${user.name} (${user.role})` : 'Authorized Officer',
    actorId: user ? user._id : null,
    action: 'FILE_COMPLIANCE',
    entityType: 'COMPLIANCE',
    entityRef: filing.acknowledgementRef || filing.filingType,
    details: `Recorded filing for '${filing.filingType}' (${filing.statutoryBody}). Ack Ref: ${filing.acknowledgementRef || 'Pending'}.`,
  });

  return filing;
};

module.exports = {
  getFilings,
  getFilingById,
  createFiling,
  recordFiling,
};
