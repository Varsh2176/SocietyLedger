const approvalService = require('../services/approvalService');

const getApprovals = async (req, res, next) => {
  try {
    const approvals = await approvalService.getApprovals(req.societyId, req.query);

    res.status(200).json({
      success: true,
      message: 'Approvals retrieved successfully.',
      data: {
        approvals,
      },
      approvals,
    });
  } catch (error) {
    next(error);
  }
};

const getApprovalById = async (req, res, next) => {
  try {
    const approval = await approvalService.getApprovalById(req.societyId, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Approval details retrieved successfully.',
      data: approval,
    });
  } catch (error) {
    next(error);
  }
};

const createApproval = async (req, res, next) => {
  try {
    const approval = await approvalService.createExpenseRequest(req.societyId, req.body, req.user);

    res.status(201).json({
      success: true,
      message: 'Expense request submitted successfully.',
      data: approval,
    });
  } catch (error) {
    next(error);
  }
};

const decideApproval = async (req, res, next) => {
  try {
    const { action, comments } = req.body;
    const approval = await approvalService.decideApproval(
      req.societyId,
      req.params.id,
      { action, comments },
      req.user
    );

    res.status(200).json({
      success: true,
      message: `Expense request ${action.toLowerCase()} successfully.`,
      data: approval,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApprovals,
  getApprovalById,
  createApproval,
  decideApproval,
};
