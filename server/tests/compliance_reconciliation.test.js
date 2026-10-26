const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, disconnectTestDB, clearCollections } = require('./setup');
const { Society, User, Reconciliation, Compliance } = require('../src/models');
const { USER_ROLES, COMPLIANCE_STATUS } = require('../src/config/constants');
const { generateToken } = require('../src/services/authService');

describe('Compliance & Bank Reconciliation Suite', () => {
  let society;
  let auditor;
  let tokenAuditor;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearCollections();

    society = await Society.create({
      name: 'Greenwood Heights RWA',
      code: 'GWH-BLR-01',
    });

    auditor = await User.create({
      name: 'Suresh Menon',
      email: 'auditor@gwh.org',
      password: 'Password123!',
      role: USER_ROLES.AUDITOR,
      societyId: society._id,
    });
    tokenAuditor = generateToken(auditor);
  });

  test('POST /api/reconciliation/:id/verify - Successfully signs off reconciliation when difference is zero', async () => {
    const rec = await Reconciliation.create({
      societyId: society._id,
      accountName: 'HDFC Bank - General Operations',
      statementPeriod: '01 Oct 2026 – 24 Oct 2026',
      statementClosingBalance: 500000,
      statementClosingBalanceInPaise: 50000000,
      bookClosingBalance: 500000,
      bookClosingBalanceInPaise: 50000000,
      differenceAmount: 0,
      differenceAmountInPaise: 0,
      status: 'PENDING_REVIEW',
    });

    const res = await request(app)
      .post(`/api/reconciliation/${rec._id}/verify`)
      .set('Authorization', `Bearer ${tokenAuditor}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('RECONCILED');
    expect(res.body.data.reconciledAt).toBeDefined();
    expect(res.body.data.reviewedBy).toContain('Suresh Menon');
  });

  test('POST /api/reconciliation/:id/verify - Blocks signoff when difference is unresolved (> ₹0)', async () => {
    const rec = await Reconciliation.create({
      societyId: society._id,
      accountName: 'SBI - Sinking Reserve',
      statementPeriod: '01 Oct 2026 – 24 Oct 2026',
      statementClosingBalance: 512000,
      statementClosingBalanceInPaise: 51200000,
      bookClosingBalance: 500000,
      bookClosingBalanceInPaise: 50000000,
      differenceAmount: 12000, // ₹ 12,000 discrepancy!
      differenceAmountInPaise: 1200000,
      status: 'DISCREPANCY_UNRESOLVED',
    });

    const res = await request(app)
      .post(`/api/reconciliation/${rec._id}/verify`)
      .set('Authorization', `Bearer ${tokenAuditor}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/cannot finalize reconciliation: unresolved difference/i);
  });

  test('PUT /api/compliance/:id - Records compliance submission with government acknowledgement reference', async () => {
    const compliance = await Compliance.create({
      societyId: society._id,
      filingType: 'Society Annual Return (Form V)',
      statutoryBody: 'Registrar of Societies',
      financialPeriod: 'FY 2025-26',
      deadline: new Date('2026-09-30'),
      status: COMPLIANCE_STATUS.PENDING,
    });

    const res = await request(app)
      .put(`/api/compliance/${compliance._id}`)
      .set('Authorization', `Bearer ${tokenAuditor}`)
      .send({
        acknowledgementRef: 'KAR-SOC-RET-2026-98102',
        status: COMPLIANCE_STATUS.FILED,
        notes: 'Filed and signed by President and Auditor.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe(COMPLIANCE_STATUS.FILED);
    expect(res.body.data.acknowledgementRef).toBe('KAR-SOC-RET-2026-98102');
  });
});
