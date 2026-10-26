const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/complianceController');
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
  complianceController.getFilings
);

router.get(
  '/:id',
  authorizeRoles(
    USER_ROLES.ADMIN,
    USER_ROLES.TREASURER,
    USER_ROLES.COMMITTEE_MEMBER,
    USER_ROLES.AUDITOR
  ),
  complianceController.getFilingById
);

router.post(
  '/',
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.TREASURER, USER_ROLES.COMMITTEE_MEMBER),
  complianceController.createFiling
);

router.put(
  '/:id',
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.TREASURER, USER_ROLES.COMMITTEE_MEMBER, USER_ROLES.AUDITOR),
  complianceController.recordFiling
);

module.exports = router;
