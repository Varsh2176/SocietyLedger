const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const fundRoutes = require('./fundRoutes');
const transactionRoutes = require('./transactionRoutes');
const approvalRoutes = require('./approvalRoutes');
const reportRoutes = require('./reportRoutes');
const residentRoutes = require('./residentRoutes');
const complianceRoutes = require('./complianceRoutes');
const documentRoutes = require('./documentRoutes');
const reconciliationRoutes = require('./reconciliationRoutes');
const eventRoutes = require('./eventRoutes');
const auditRoutes = require('./auditRoutes');
const societyRoutes = require('./societyRoutes');

// Mount API sub-routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/funds', fundRoutes);
router.use('/transactions', transactionRoutes);
router.use('/approvals', approvalRoutes);
router.use('/reports', reportRoutes);
router.use('/resident', residentRoutes);
router.use('/compliance', complianceRoutes);
router.use('/documents', documentRoutes);
router.use('/reconciliation', reconciliationRoutes);
router.use('/events', eventRoutes);
router.use('/audit', auditRoutes);
router.use('/society', societyRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'SocietyLedger API Gateway',
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
