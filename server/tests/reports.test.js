const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, disconnectTestDB, clearCollections } = require('./setup');
const { Society, User, Fund, Transaction } = require('../src/models');
const { USER_ROLES, TRANSACTION_STATUS, TRANSACTION_TYPES, FUND_TYPES } = require('../src/config/constants');
const { generateToken } = require('../src/services/authService');

describe('Reporting & Dashboard Aggregations Suite', () => {
  let society;
  let admin;
  let token;
  let corpusFund, maintFund;

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
      statutoryAuditStatus: 'VERIFIED_FY25_26',
    });

    admin = await User.create({
      name: 'Dr. Anand Rao',
      email: 'admin@gwh.org',
      password: 'Password123!',
      role: USER_ROLES.ADMIN,
      societyId: society._id,
    });
    token = generateToken(admin);

    corpusFund = await Fund.create({
      societyId: society._id,
      name: 'General Corpus Reserve Fund',
      code: 'FND-CORPUS',
      type: FUND_TYPES.CORPUS,
      openingBalance: 2000000,
      openingBalanceInPaise: 200000000,
      currentBalance: 2000000,
      currentBalanceInPaise: 200000000,
    });

    maintFund = await Fund.create({
      societyId: society._id,
      name: 'Monthly Maintenance & Operational Account',
      code: 'FND-MAINT',
      type: FUND_TYPES.OPERATIONAL,
      openingBalance: 500000,
      openingBalanceInPaise: 50000000,
      currentBalance: 500000,
      currentBalanceInPaise: 50000000,
    });

    // Create posted income: Maintenance collections ₹ 1,00,000
    await Transaction.create({
      societyId: society._id,
      reference: 'VR-2026-INC1',
      date: new Date(),
      type: TRANSACTION_TYPES.INCOME,
      fund: maintFund.name,
      fundId: maintFund._id,
      category: 'Maintenance Dues',
      description: 'Monthly Maintenance',
      amount: 100000,
      amountInPaise: 10000000,
      status: TRANSACTION_STATUS.PAID,
    });

    // Create posted expense: Lift AMC ₹ 20,000
    await Transaction.create({
      societyId: society._id,
      reference: 'VR-2026-EXP1',
      date: new Date(),
      type: TRANSACTION_TYPES.EXPENSE,
      fund: maintFund.name,
      fundId: maintFund._id,
      category: 'Lift AMC',
      description: 'Lift AMC Q3',
      amount: 20000,
      amountInPaise: 2000000,
      status: TRANSACTION_STATUS.PAID,
    });

    // Internal Transfer: Transfer ₹ 50,000 from Maint Fund to Corpus Fund
    // Reporting integrity rule: this must NOT count as external income or expense!
    await Transaction.create({
      societyId: society._id,
      reference: 'VR-2026-TRF1',
      date: new Date(),
      type: TRANSACTION_TYPES.TRANSFER,
      fund: maintFund.name,
      fundId: maintFund._id,
      toFund: corpusFund.name,
      toFundId: corpusFund._id,
      category: 'Fund Transfer',
      description: 'Surplus transfer',
      amount: 50000,
      amountInPaise: 5000000,
      status: TRANSACTION_STATUS.PAID,
    });
  });

  test('GET /api/dashboard/summary - Accurately computes totals and excludes internal transfers from external cashflow', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(data.totalAvailableFunds).toBe(2500000); // 2000000 + 500000
    expect(data.corpusFundBalance).toBe(2000000);
    expect(data.maintenanceFundBalance).toBe(500000);

    // External income must be ₹ 1,00,000 (NOT including the 50k transfer!)
    expect(data.totalIncomeMonth).toBe(100000);

    // External expense must be ₹ 20,000 (NOT including the 50k transfer!)
    expect(data.totalExpenseMonth).toBe(20000);

    expect(data.statutoryAuditStatus).toBe('VERIFIED_FY25_26');
  });

  test('GET /api/dashboard/charts - Returns structured datasets for charts', async () => {
    const res = await request(app)
      .get('/api/dashboard/charts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.monthlyCashflow)).toBe(true);
    expect(Array.isArray(res.body.data.fundDistribution)).toBe(true);
    expect(Array.isArray(res.body.data.categoryBreakdown)).toBe(true);
  });

  test('GET /api/reports/income-expenditure - Computes net surplus correctly', async () => {
    const res = await request(app)
      .get('/api/reports/income-expenditure')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.income.total).toBe(100000);
    expect(res.body.data.expenditure.total).toBe(20000);
    expect(res.body.data.netSurplus).toBe(80000); // 100,000 - 20,000
  });
});
