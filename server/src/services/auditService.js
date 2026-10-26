const { AuditLog, AuditObservation } = require('../models');

/**
 * Creates an immutable audit log entry for important financial & governance actions.
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
    console.error('[Audit Log Error] Failed to write audit record:', error.message);
    return null;
  }
};

/**
 * Retrieves audit logs with optional filtering and pagination
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

  const query = { societyId };

  if (action && action !== 'ALL') {
    query.action = action;
  }
  if (entityType && entityType !== 'ALL') {
    query.entityType = entityType;
  }
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  if (search) {
    query.$or = [
      { details: { $regex: search, $options: 'i' } },
      { entityRef: { $regex: search, $options: 'i' } },
      { actor: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [logs, total] = await Promise.all([
    AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(Number(limit)),
    AuditLog.countDocuments(query),
  ]);

  return {
    logs,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    },
  };
};

/**
 * Retrieves audit observations
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
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { observation: { $regex: search, $options: 'i' } },
      { relatedEntity: { $regex: search, $options: 'i' } },
    ];
  }

  const observations = await AuditObservation.find(query).sort({ date: -1, createdAt: -1 });
  return observations;
};

/**
 * Creates a new audit observation
 */
const createObservation = async (societyId, data) => {
  const observation = await AuditObservation.create({
    societyId,
    title: data.title,
    severity: data.severity,
    status: data.status || 'OPEN',
    date: data.date || new Date().toISOString().split('T')[0],
    relatedEntity: data.relatedEntity,
    assignedTo: data.assignedTo,
    observation: data.observation,
    correctiveAction: data.correctiveAction || '',
    evidenceDocument: data.evidenceDocument || null,
    isWarningOnly: Boolean(data.isWarningOnly),
  });

  return observation;
};

/**
 * Updates an audit observation (e.g., status or corrective action)
 */
const updateObservation = async (societyId, id, updateData) => {
  const observation = await AuditObservation.findOne({ _id: id, societyId });
  if (!observation) {
    const error = new Error('Audit observation record not found.');
    error.statusCode = 404;
    throw error;
  }

  if (updateData.status) observation.status = updateData.status;
  if (updateData.correctiveAction !== undefined) observation.correctiveAction = updateData.correctiveAction;
  if (updateData.assignedTo) observation.assignedTo = updateData.assignedTo;

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
