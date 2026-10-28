
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate } = require('../middleware/authMiddleware');
const { enforceSocietyScope } = require('../middleware/societyScope');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { USER_ROLES } = require('../config/constants');

const { ADMIN, TREASURER, COMMITTEE_MEMBER, AUDITOR } = USER_ROLES;

router.use(authenticate, enforceSocietyScope);

// All authenticated society members can view events.
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);

// Members can submit proposals.
router.post('/', eventController.createProposal);

// Financial approval: administrators and treasurers.
router.patch(
  '/:id/approve',
  authorizeRoles(ADMIN, TREASURER),
  eventController.approveProposal
);

router.patch(
  '/:id/reject',
  authorizeRoles(ADMIN, TREASURER, COMMITTEE_MEMBER),
  eventController.rejectProposal
);

// Vendor and expense management.
router.patch(
  '/:id/vendor',
  authorizeRoles(ADMIN, TREASURER, COMMITTEE_MEMBER),
  eventController.selectVendor
);

router.post(
  '/:id/invoices',
  authorizeRoles(ADMIN, TREASURER),
  eventController.recordInvoice
);

// Settlement is restricted to financial administrators.
router.patch(
  '/:id/settle',
  authorizeRoles(ADMIN, TREASURER),
  eventController.settleEvent
);

module.exports = router;
