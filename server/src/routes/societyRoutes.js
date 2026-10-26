const express = require('express');
const router = express.Router();
const societyController = require('../controllers/societyController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { enforceSocietyScope } = require('../middleware/societyScope');
const { USER_ROLES } = require('../config/constants');

router.use(authenticate, enforceSocietyScope);

router.get('/', societyController.getSociety);
router.put('/', authorizeRoles(USER_ROLES.ADMIN), societyController.updateSociety);

router.get('/members', societyController.getMembers);
router.put('/members/:id', authorizeRoles(USER_ROLES.ADMIN), societyController.updateMember);

module.exports = router;
