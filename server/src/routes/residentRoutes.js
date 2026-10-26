const express = require('express');
const router = express.Router();
const residentController = require('../controllers/residentController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { enforceSocietyScope } = require('../middleware/societyScope');
const { USER_ROLES } = require('../config/constants');

router.use(authenticate, enforceSocietyScope);

// Certified transparency portal disclosures
router.get('/transparency', residentController.getTransparency);

// Resident clarification queries
router.get('/queries', residentController.getQueries);
router.post('/queries', residentController.submitQuery);

// Respond to resident query: Committee, Treasurer, Admin
router.post(
  '/queries/:id/answer',
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.TREASURER, USER_ROLES.COMMITTEE_MEMBER),
  residentController.answerQuery
);
router.put(
  '/queries/:id/answer',
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.TREASURER, USER_ROLES.COMMITTEE_MEMBER),
  residentController.answerQuery
);

module.exports = router;
