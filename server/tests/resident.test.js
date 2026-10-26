const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, disconnectTestDB, clearCollections } = require('./setup');
const { Society, User, Fund, ResidentQuery } = require('../src/models');
const { USER_ROLES, FUND_TYPES, QUERY_STATUS } = require('../src/config/constants');
const { generateToken } = require('../src/services/authService');

describe('Resident Transparency Portal & Queries Suite', () => {
  let society;
  let resident, treasurer;
  let tokenResident, tokenTreasurer;

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

    resident = await User.create({
      name: 'Arun Varma',
      email: 'arun@society.org',
      password: 'Password123!',
      role: USER_ROLES.RESIDENT,
      societyId: society._id,
      apartmentNumber: 'B-302',
    });
    tokenResident = generateToken(resident);

    treasurer = await User.create({
      name: 'Priya Sharma',
      email: 'priya@society.org',
      password: 'Password123!',
      role: USER_ROLES.TREASURER,
      societyId: society._id,
    });
    tokenTreasurer = generateToken(treasurer);

    await Fund.create({
      societyId: society._id,
      name: 'Operational Maintenance Fund',
      code: 'FND-MAINT',
      type: FUND_TYPES.OPERATIONAL,
      openingBalance: 500000,
      currentBalance: 500000,
      bankAccount: 'HDFC Bank - A/C 991204891024', // Sensitive unmasked account
    });
  });

  test('GET /api/resident/transparency - Enforces privacy: redacts private bank account numbers', async () => {
    const res = await request(app)
      .get('/api/resident/transparency')
      .set('Authorization', `Bearer ${tokenResident}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(data.publishedFunds).toBeDefined();
    expect(data.publishedFunds.length).toBeGreaterThan(0);

    // Privacy rule check: raw full account number 991204891024 must NOT be revealed
    const bankName = data.publishedFunds[0].bankName;
    expect(bankName).not.toContain('991204891024');
    expect(bankName).toContain('****');
  });

  test('POST /api/resident/queries - Resident can submit clarification query', async () => {
    const res = await request(app)
      .post('/api/resident/queries')
      .set('Authorization', `Bearer ${tokenResident}`)
      .send({
        category: 'Maintenance Billing',
        subject: 'Clarification on water tanker expense',
        question: 'Why did emergency tanker expenditure rise in September?',
        unit: 'B-302',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reference).toMatch(/^QRY-/);
    expect(res.body.data.status).toBe(QUERY_STATUS.OPEN);
  });

  test('POST /api/resident/queries/:id/answer - Authorized committee can answer query', async () => {
    const query = await ResidentQuery.create({
      societyId: society._id,
      reference: 'QRY-2026-901',
      category: 'Maintenance Billing',
      subject: 'Tanker clarification',
      unit: 'B-302',
      residentId: resident._id,
      residentName: resident.name,
      question: 'Why did emergency tanker expenditure rise in September?',
      status: QUERY_STATUS.OPEN,
    });

    const res = await request(app)
      .post(`/api/resident/queries/${query._id}/answer`)
      .set('Authorization', `Bearer ${tokenTreasurer}`)
      .send({
        replyText: 'Municipal pipeline maintenance for 4 days necessitated emergency tankers. Logbook verified.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe(QUERY_STATUS.ANSWERED);
    expect(res.body.data.response.replyText).toContain('Municipal pipeline maintenance');
    expect(res.body.data.response.answeredBy).toContain('Priya Sharma');
  });
});
