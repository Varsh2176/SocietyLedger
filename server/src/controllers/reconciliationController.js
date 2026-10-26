const reconciliationService = require('../services/reconciliationService');

const getReconciliations = async (req, res, next) => {
  try {
    const reconciliations = await reconciliationService.getReconciliations(req.societyId);

    res.status(200).json({
      success: true,
      message: 'Reconciliation records retrieved successfully.',
      data: {
        reconciliations,
      },
      reconciliations,
    });
  } catch (error) {
    next(error);
  }
};

const getReconciliationById = async (req, res, next) => {
  try {
    const reconciliation = await reconciliationService.getReconciliationById(req.societyId, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Reconciliation record details retrieved successfully.',
      data: reconciliation,
    });
  } catch (error) {
    next(error);
  }
};

const runVerification = async (req, res, next) => {
  try {
    const reconciliation = await reconciliationService.verifyReconciliation(
      req.societyId,
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'Reconciliation verified and signed off successfully.',
      data: reconciliation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReconciliations,
  getReconciliationById,
  runVerification,
};
