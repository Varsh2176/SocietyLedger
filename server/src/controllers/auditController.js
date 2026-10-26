const auditService = require('../services/auditService');

const getAuditLogs = async (req, res, next) => {
  try {
    const result = await auditService.getAuditLogs(req.societyId, req.query);

    res.status(200).json({
      success: true,
      message: 'Audit logs retrieved successfully.',
      data: {
        logs: result.logs,
      },
      logs: result.logs,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

const getObservations = async (req, res, next) => {
  try {
    const observations = await auditService.getObservations(req.societyId, req.query);

    res.status(200).json({
      success: true,
      message: 'Audit observations retrieved successfully.',
      data: {
        observations,
      },
      observations,
    });
  } catch (error) {
    next(error);
  }
};

const createObservation = async (req, res, next) => {
  try {
    const observation = await auditService.createObservation(req.societyId, req.body);

    res.status(201).json({
      success: true,
      message: 'Audit observation recorded successfully.',
      data: observation,
    });
  } catch (error) {
    next(error);
  }
};

const updateObservation = async (req, res, next) => {
  try {
    const observation = await auditService.updateObservation(req.societyId, req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Audit observation updated successfully.',
      data: observation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs,
  getObservations,
  createObservation,
  updateObservation,
};
