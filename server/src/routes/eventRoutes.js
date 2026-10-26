const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate } = require('../middleware/authMiddleware');
const { enforceSocietyScope } = require('../middleware/societyScope');

router.use(authenticate, enforceSocietyScope);

router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.post('/', eventController.createProposal);

module.exports = router;
