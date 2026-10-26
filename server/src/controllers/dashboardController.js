const reportService = require('../services/reportService');

/**
 * Get dashboard metric summary
 */
const getSummary = async (req, res, next) => {
  try {
    const summary = await reportService.getDashboardSummary(req.societyId, req.query.period);

    res.status(200).json({
      success: true,
      message: 'Dashboard summary retrieved successfully.',
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get analytical dashboard charts
 */
const getCharts = async (req, res, next) => {
  try {
    const charts = await reportService.getDashboardCharts(req.societyId, req.query.period);

    res.status(200).json({
      success: true,
      message: 'Dashboard charts retrieved successfully.',
      data: charts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getCharts,
};
