const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { enforceSocietyScope } = require('../middleware/societyScope');
const { USER_ROLES } = require('../config/constants');

router.use(authenticate, enforceSocietyScope);

// Approvals queue: Committee, Treasurer, Admin
router.get(
  '/',
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.TREASURER, USER_ROLES.COMMITTEE_MEMBER),
  approvalController.getApprovals
);

router.get(
  '/:id',
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.TREASURER, USER_ROLES.COMMITTEE_MEMBER),
  approvalController.getApprovalById
);

// Submit an expense request
router.post('/', approvalController.createApproval);

// Decide on expense request (Approve / Reject / Info Requested)
router.post(
  '/:id/decision',
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.TREASURER, USER_ROLES.COMMITTEE_MEMBER),
  approvalController.decideApproval
);

module.exports = router;
