const transactionService = require('../services/transactionService');

const getTransactions = async (req, res, next) => {
  try {
    const result = await transactionService.getTransactions(req.societyId, req.query);

    res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully.',
      data: {
        transactions: result.transactions,
      },
      transactions: result.transactions,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(req.societyId, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Transaction details retrieved successfully.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.createTransaction(req.societyId, req.body, req.user);

    res.status(201).json({
      success: true,
      message: 'Transaction voucher posted successfully.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

const reverseTransaction = async (req, res, next) => {
  try {
    const { justification } = req.body;
    const transaction = await transactionService.reverseTransaction(
      req.societyId,
      req.params.id,
      justification,
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'Transaction voucher reversed successfully with audit justification.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  reverseTransaction,
};
