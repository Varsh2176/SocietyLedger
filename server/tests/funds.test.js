const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, disconnectTestDB, clearCollections } = require('./setup');
const { Society, User, Fund } = require('../src/models');
const { USER_ROLES, FUND_TYPES } = require('../src/config/constants');
const { generateToken } = require('../src/services/authService');

describe('Fund Management & Multi-Type Reserve Suite', () => {
  let society;
  let treasurer;
  let token;

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
  });

  test('POST /api/funds - Creates restricted Corpus Fund with rupee-paise sync', async () => {
    const res = await request(app)
      .post('/api/funds')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'General Corpus Reserve Fund',
        code: 'FND-CORPUS',
        type: FUND_TYPES.CORPUS,
        openingBalance: 2500000,
        restrictedUse: true,
        purpose: 'Long-term reserve held in bank fixed deposits.',
        bankAccount: 'HDFC Bank - A/C ****4891',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe('FND-CORPUS');
    expect(res.body.data.currentBalance).toBe(2500000);
    expect(res.body.data.currentBalanceInPaise).toBe(250000000);
    expect(res.body.data.restrictedUse).toBe(true);
  });

  test('POST /api/funds - Prevents duplicate fund code in same society', async () => {
    await request(app)
      .post('/api/funds')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Sinking Fund Alpha',
        code: 'FND-SINKING',
        type: FUND_TYPES.SINKING,
        openingBalance: 100000,
      });

    const res = await request(app)
      .post('/api/funds')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Duplicate Sinking Fund',
        code: 'FND-SINKING',
        type: FUND_TYPES.SINKING,
        openingBalance: 50000,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test('GET /api/funds - Retrieves funds with search and type filters', async () => {
    await Fund.create([
      {
        societyId: society._id,
        name: 'General Corpus Reserve Fund',
        code: 'FND-CORPUS',
        type: FUND_TYPES.CORPUS,
        openingBalance: 2000000,
        currentBalance: 2000000,
      },
      {
        societyId: society._id,
        name: 'Monthly Maintenance Account',
        code: 'FND-MAINT',
        type: FUND_TYPES.OPERATIONAL,
        openingBalance: 300000,
        currentBalance: 300000,
      },
    ]);

    const resAll = await request(app)
      .get('/api/funds')
      .set('Authorization', `Bearer ${token}`);

    expect(resAll.status).toBe(200);
    expect(resAll.body.funds.length).toBe(2);

    const resCorpus = await request(app)
      .get(`/api/funds?type=${FUND_TYPES.CORPUS}`)
      .set('Authorization', `Bearer ${token}`);

    expect(resCorpus.status).toBe(200);
    expect(resCorpus.body.funds.length).toBe(1);
    expect(resCorpus.body.funds[0].code).toBe('FND-CORPUS');
  });
});
