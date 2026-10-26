const reportService = require('../services/reportService');

const getIncomeExpenditure = async (req, res, next) => {
  try {
    const report = await reportService.getIncomeExpenditureReport(req.societyId, req.query);

    res.status(200).json({
      success: true,
      message: 'Income & Expenditure statement retrieved successfully.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

const getFundStatement = async (req, res, next) => {
  try {
    const statement = await reportService.getFundStatementReport(req.societyId, req.query);

    res.status(200).json({
      success: true,
      message: 'Fund-wise statement retrieved successfully.',
      data: statement,
    });
  } catch (error) {
    next(error);
  }
};

const getBalanceSheet = async (req, res, next) => {
  try {
    const balanceSheet = await reportService.getBalanceSheetReport(req.societyId, req.query);

    res.status(200).json({
      success: true,
      message: 'Balance sheet statement retrieved successfully.',
      data: balanceSheet,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIncomeExpenditure,
  getFundStatement,
  getBalanceSheet,
};
