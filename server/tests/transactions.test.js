const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, disconnectTestDB, clearCollections } = require('./setup');
const { Society, User, Fund, Transaction } = require('../src/models');
const { USER_ROLES, TRANSACTION_STATUS, TRANSACTION_TYPES } = require('../src/config/constants');
const { generateToken } = require('../src/services/authService');

describe('Financial Transactions & Ledger Integrity Suite', () => {
  let society;
  let treasurer;
  let token;
  let maintFund;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearCollections();

    society = await Society.create({ name: 'Greenwood Heights RWA', code: 'GWH-BLR-01' });

    treasurer = await User.create({
      name: 'Priya Sharma',
      email: 'treasurer@gwh.org',
      password: 'Password123!',
      role: USER_ROLES.TREASURER,
      societyId: society._id,
    });
    token = generateToken(treasurer);

    maintFund = await Fund.create({
      societyId: society._id,
      name: 'Monthly Maintenance & Operational Account',
      code: 'FND-MAINT',
      type: 'OPERATIONAL',
      openingBalance: 100000,
      openingBalanceInPaise: 10000000,
      currentBalance: 100000,
      currentBalanceInPaise: 10000000,
    });
  });

  test('POST /api/transactions - Creates valid expense voucher and debits fund', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        reference: 'VR-2026-101',
        date: '2026-10-25',
        type: TRANSACTION_TYPES.EXPENSE,
        fund: maintFund.name,
        fundCode: maintFund.code,
        category: 'Elevator Maintenance',
        description: 'Monthly Lift AMC',
        amount: 15000, // ₹ 15,000
        paymentMethod: 'NEFT_RTGS',
        status: TRANSACTION_STATUS.PAID,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(15000);
    // Integer paise verification: 15000 * 100 = 1500000
    expect(res.body.data.amountInPaise).toBe(1500000);

    // Verify fund balance debited: 100,000 - 15,000 = 85,000
    const updatedFund = await Fund.findById(maintFund._id);
    expect(updatedFund.currentBalance).toBe(85000);
    expect(updatedFund.currentBalanceInPaise).toBe(8500000);
  });

  test('POST /api/transactions - Rejects invalid negative amount', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        reference: 'VR-2026-NEG',
        type: TRANSACTION_TYPES.EXPENSE,
        fund: maintFund.name,
        category: 'Invalid',
        description: 'Negative test',
        amount: -500,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/transactions/:id/reverse - Successfully reverses transaction with mandatory audit justification', async () => {
    const tx = await Transaction.create({
      societyId: society._id,
      reference: 'VR-2026-200',
      type: TRANSACTION_TYPES.EXPENSE,
      fund: maintFund.name,
      fundCode: maintFund.code,
      fundId: maintFund._id,
      category: 'Gardening',
      description: 'Horticulture services',
      amount: 10000,
      amountInPaise: 1000000,
      status: TRANSACTION_STATUS.PAID,
    });

    // Check balance before reversal
    const fundBefore = await Fund.findById(maintFund._id);

    const res = await request(app)
      .post(`/api/transactions/${tx._id}/reverse`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        justification: 'Duplicate voucher entered in error by vendor billing team.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe(TRANSACTION_STATUS.REVERSED);
    expect(res.body.data.reversalReason).toBe('Duplicate voucher entered in error by vendor billing team.');
    expect(res.body.data.reversedAt).toBeDefined();

    // Verify transaction record is NOT deleted, but preserved with status REVERSED
    const persistedTx = await Transaction.findById(tx._id);
    expect(persistedTx).not.toBeNull();
    expect(persistedTx.status).toBe(TRANSACTION_STATUS.REVERSED);
  });

  test('POST /api/transactions/:id/reverse - Rejects reversal without mandatory justification', async () => {
    const tx = await Transaction.create({
      societyId: society._id,
      reference: 'VR-2026-201',
      type: TRANSACTION_TYPES.EXPENSE,
      fund: maintFund.name,
      fundCode: maintFund.code,
      fundId: maintFund._id,
      category: 'Utilities',
      description: 'Electricity bill',
      amount: 5000,
      amountInPaise: 500000,
      status: TRANSACTION_STATUS.PAID,
    });

    const res = await request(app)
      .post(`/api/transactions/${tx._id}/reverse`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        justification: '', // empty justification
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/mandatory reversal justification/i);
  });
});
