
const { AuditLog, AuditObservation } = require('../models');

/**
 * Creates an audit log entry for financial and governance actions.
 * Audit failures are propagated to the caller.
 */
const logAction = async ({
  societyId,
  actor,
  actorId,
  action,
  entityType,
  entityRef,
  details,
}) => {
  try {
    const log = await AuditLog.create({
      societyId,
      actor,
      actorId,
      action,
      entityType,
      entityRef,
      details,
      timestamp: new Date(),
    });

    return log;
  } catch (error) {
    console.error(
      '[Audit Log Error] Failed to write audit record:',
      error.message
    );
    throw error;
  }
};

/**
 * Retrieves audit logs with filtering and pagination.
 */
const getAuditLogs = async (societyId, params = {}) => {
  const {
    page = 1,
    limit = 20,
    action,
    entityType,
    search,
    startDate,
    endDate,
  } = params;

  const pageNumber = Number(page);
  const pageSize = Number(limit);

  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 1 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100
  ) {
    const error = new Error(
      'Page must be positive and limit must be between 1 and 100.'
    );
    error.statusCode = 400;
    throw error;
  }

  const query = { societyId };

  if (action && action !== 'ALL') {
    query.action = action;
  }

  if (entityType && entityType !== 'ALL') {
    query.entityType = entityType;
  }

  if (startDate || endDate) {
    query.timestamp = {};

    if (startDate) {
      const start = new Date(startDate);

      if (Number.isNaN(start.getTime())) {
        const error = new Error('Invalid start date.');
        error.statusCode = 400;
        throw error;
      }

      query.timestamp.$gte = start;
    }

    if (endDate) {
      const end = new Date(endDate);

      if (Number.isNaN(end.getTime())) {
        const error = new Error('Invalid end date.');
        error.statusCode = 400;
        throw error;
      }

      query.timestamp.$lte = end;
    }

    if (
      query.timestamp.$gte &&
      query.timestamp.$lte &&
      query.timestamp.$gte > query.timestamp.$lte
    ) {
      const error = new Error(
        'Start date cannot be later than end date.'
      );
      error.statusCode = 400;
      throw error;
    }
  }

  if (search && String(search).trim()) {
    const escapedSearch = String(search)
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    query.$or = [
      { details: { $regex: escapedSearch, $options: 'i' } },
      { entityRef: { $regex: escapedSearch, $options: 'i' } },
      { actor: { $regex: escapedSearch, $options: 'i' } },
    ];
  }

  const skip = (pageNumber - 1) * pageSize;

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(pageSize),
    AuditLog.countDocuments(query),
  ]);

  return {
    logs,
    meta: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

/**
 * Retrieves audit observations for a society.
 */
const getObservations = async (societyId, params = {}) => {
  const { severity, status, search } = params;
  const query = { societyId };

  if (severity && severity !== 'ALL') {
    query.severity = severity;
  }

  if (status && status !== 'ALL') {
    query.status = status;
  }

  if (search && String(search).trim()) {
    const escapedSearch = String(search)
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    query.$or = [
      { title: { $regex: escapedSearch, $options: 'i' } },
      { observation: { $regex: escapedSearch, $options: 'i' } },
      { relatedEntity: { $regex: escapedSearch, $options: 'i' } },
    ];
  }

  return AuditObservation.find(query).sort({
    date: -1,
    createdAt: -1,
  });
};

/**
 * Creates a new audit observation.
 */
const createObservation = async (societyId, data = {}) => {
  if (
    !data.title ||
    !String(data.title).trim() ||
    !data.severity ||
    !data.observation ||
    !String(data.observation).trim()
  ) {
    const error = new Error(
      'Title, severity, and observation are required.'
    );
    error.statusCode = 400;
    throw error;
  }

  const observation = await AuditObservation.create({
    societyId,
    title: String(data.title).trim(),
    severity: data.severity,
    status: data.status || 'OPEN',
    date: data.date || new Date().toISOString().split('T')[0],
    relatedEntity: data.relatedEntity,
    assignedTo: data.assignedTo,
    observation: String(data.observation).trim(),
    correctiveAction: data.correctiveAction || '',
    evidenceDocument: data.evidenceDocument || null,
    isWarningOnly: Boolean(data.isWarningOnly),
  });

  return observation;
};

/**
 * Updates an audit observation belonging to the specified society.
 */
const updateObservation = async (societyId, id, updateData = {}) => {
  if (!id) {
    const error = new Error('Observation ID is required.');
    error.statusCode = 400;
    throw error;
  }

  const observation = await AuditObservation.findOne({
    _id: id,
    societyId,
  });

  if (!observation) {
    const error = new Error('Audit observation record not found.');
    error.statusCode = 404;
    throw error;
  }

  if (updateData.status !== undefined) {
    observation.status = updateData.status;
  }

  if (updateData.correctiveAction !== undefined) {
    observation.correctiveAction = updateData.correctiveAction;
  }

  if (updateData.assignedTo !== undefined) {
    observation.assignedTo = updateData.assignedTo;
  }

  await observation.save();

  return observation;
};

module.exports = {
  logAction,
  getAuditLogs,
  getObservations,
  createObservation,
  updateObservation,
};
