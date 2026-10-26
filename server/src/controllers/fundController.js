const fundService = require('../services/fundService');

const getFunds = async (req, res, next) => {
  try {
    const funds = await fundService.getFunds(req.societyId, req.query);

    res.status(200).json({
      success: true,
      message: 'Funds retrieved successfully.',
      data: {
        funds,
      },
      funds,
    });
  } catch (error) {
    next(error);
  }
};

const getFundById = async (req, res, next) => {
  try {
    const fund = await fundService.getFundById(req.societyId, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Fund details retrieved successfully.',
      data: fund,
    });
  } catch (error) {
    next(error);
  }
};

const createFund = async (req, res, next) => {
  try {
    const fund = await fundService.createFund(req.societyId, req.body, req.user);

    res.status(201).json({
      success: true,
      message: 'Fund created successfully.',
      data: fund,
    });
  } catch (error) {
    next(error);
  }
};

const updateFund = async (req, res, next) => {
  try {
    const fund = await fundService.updateFund(req.societyId, req.params.id, req.body, req.user);

    res.status(200).json({
      success: true,
      message: 'Fund updated successfully.',
      data: fund,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFunds,
  getFundById,
  createFund,
  updateFund,
};
