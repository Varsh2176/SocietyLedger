const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { enforceSocietyScope } = require('../middleware/societyScope');
const { USER_ROLES } = require('../config/constants');

router.use(authenticate, enforceSocietyScope);

router.get(
  '/logs',
  authorizeRoles(
    USER_ROLES.ADMIN,
    USER_ROLES.AUDITOR,
    USER_ROLES.TREASURER,
    USER_ROLES.COMMITTEE_MEMBER
  ),
  auditController.getAuditLogs
);

router.get(
  '/observations',
  authorizeRoles(
    USER_ROLES.ADMIN,
    USER_ROLES.AUDITOR,
    USER_ROLES.TREASURER,
    USER_ROLES.COMMITTEE_MEMBER
  ),
  auditController.getObservations
);

router.post(
  '/observations',
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.AUDITOR),
  auditController.createObservation
);

router.put(
  '/observations/:id',
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.AUDITOR, USER_ROLES.TREASURER),
  auditController.updateObservation
);

module.exports = router;
