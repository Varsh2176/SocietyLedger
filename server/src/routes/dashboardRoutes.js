const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authMiddleware');
const { enforceSocietyScope } = require('../middleware/societyScope');

router.use(authenticate, enforceSocietyScope);

router.get('/summary', dashboardController.getSummary);
router.get('/charts', dashboardController.getCharts);

module.exports = router;
