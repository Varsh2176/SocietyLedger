const express = require('express');
const router = express.Router();
const reconciliationController = require('../controllers/reconciliationController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { enforceSocietyScope } = require('../middleware/societyScope');
const { USER_ROLES } = require('../config/constants');

router.use(authenticate, enforceSocietyScope);

router.get(
  '/',
  authorizeRoles(
    USER_ROLES.ADMIN,
    USER_ROLES.TREASURER,
    USER_ROLES.COMMITTEE_MEMBER,
    USER_ROLES.AUDITOR
  ),
  reconciliationController.getReconciliations
);

router.get(
  '/:id',
  authorizeRoles(
    USER_ROLES.ADMIN,
    USER_ROLES.TREASURER,
    USER_ROLES.COMMITTEE_MEMBER,
    USER_ROLES.AUDITOR
  ),
  reconciliationController.getReconciliationById
);

// Sign off reconciliation: Auditor, Treasurer, Admin
router.post(
  '/:id/verify',
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.TREASURER, USER_ROLES.AUDITOR),
  reconciliationController.runVerification
);

module.exports = router;
