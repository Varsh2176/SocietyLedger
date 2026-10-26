const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { enforceSocietyScope } = require('../middleware/societyScope');
const { USER_ROLES } = require('../config/constants');

router.use(authenticate, enforceSocietyScope);

// List and get transaction vouchers
router.get('/', transactionController.getTransactions);
router.get('/:id', transactionController.getTransactionById);

// Create new transaction voucher: Admin, Treasurer only
router.post(
  '/',
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.TREASURER),
  transactionController.createTransaction
);

// Audited transaction reversal: Admin, Treasurer only
router.post(
  '/:id/reverse',
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.TREASURER),
  transactionController.reverseTransaction
);

module.exports = router;
