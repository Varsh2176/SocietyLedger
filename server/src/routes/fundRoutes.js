const express = require('express');
const router = express.Router();
const fundController = require('../controllers/fundController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { enforceSocietyScope } = require('../middleware/societyScope');
const { USER_ROLES } = require('../config/constants');

router.use(authenticate, enforceSocietyScope);

// List and get details: accessible by Admin, Treasurer, Committee Member, Auditor
router.get(
  '/',
  authorizeRoles(
    USER_ROLES.ADMIN,
    USER_ROLES.TREASURER,
    USER_ROLES.COMMITTEE_MEMBER,
    USER_ROLES.AUDITOR
  ),
  fundController.getFunds
);

router.get(
  '/:id',
  authorizeRoles(
    USER_ROLES.ADMIN,
    USER_ROLES.TREASURER,
    USER_ROLES.COMMITTEE_MEMBER,
    USER_ROLES.AUDITOR
  ),
  fundController.getFundById
);

// Create and update funds: Admin, Treasurer only
router.post(
  '/',
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.TREASURER),
  fundController.createFund
);

router.put(
  '/:id',
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.TREASURER),
  fundController.updateFund
);

module.exports = router;
