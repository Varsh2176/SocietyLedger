const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/authMiddleware');
const { enforceSocietyScope } = require('../middleware/societyScope');

router.use(authenticate, enforceSocietyScope);

router.get('/income-expenditure', reportController.getIncomeExpenditure);
router.get('/fund-statement', reportController.getFundStatement);
router.get('/balance-sheet', reportController.getBalanceSheet);

module.exports = router;
