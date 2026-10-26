const complianceService = require('../services/complianceService');

const getFilings = async (req, res, next) => {
  try {
    const filings = await complianceService.getFilings(req.societyId, req.query);

    res.status(200).json({
      success: true,
      message: 'Compliance filings retrieved successfully.',
      data: {
        filings,
      },
      filings,
    });
  } catch (error) {
    next(error);
  }
};

const getFilingById = async (req, res, next) => {
  try {
    const filing = await complianceService.getFilingById(req.societyId, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Compliance filing details retrieved successfully.',
      data: filing,
    });
  } catch (error) {
    next(error);
  }
};

const recordFiling = async (req, res, next) => {
  try {
    const filing = await complianceService.recordFiling(req.societyId, req.params.id, req.body, req.user);

    res.status(200).json({
      success: true,
      message: 'Compliance filing recorded successfully.',
      data: filing,
    });
  } catch (error) {
    next(error);
  }
};

const createFiling = async (req, res, next) => {
  try {
    const filing = await complianceService.createFiling(req.societyId, req.body, req.user);

    res.status(201).json({
      success: true,
      message: 'Compliance obligation created successfully.',
      data: filing,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFilings,
  getFilingById,
  recordFiling,
  createFiling,
};
