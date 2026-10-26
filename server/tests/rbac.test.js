const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, disconnectTestDB, clearCollections } = require('./setup');
const { Society, User } = require('../src/models');
const { USER_ROLES } = require('../src/config/constants');
const { generateToken } = require('../src/services/authService');

describe('Role-Based Access Control & Society Isolation Suite', () => {
  let societyA, societyB;
  let residentA, treasurerA, adminA;
  let tokenResidentA, tokenTreasurerA, tokenAdminA;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearCollections();

    societyA = await Society.create({ name: 'Society Alpha', code: 'SOC-ALPHA' });
    societyB = await Society.create({ name: 'Society Beta', code: 'SOC-BETA' });

    residentA = await User.create({
      name: 'Resident A',
      email: 'resident.a@alpha.com',
      password: 'Password123!',
      role: USER_ROLES.RESIDENT,
      societyId: societyA._id,
    });
    tokenResidentA = generateToken(residentA);

    treasurerA = await User.create({
      name: 'Treasurer A',
      email: 'treasurer.a@alpha.com',
      password: 'Password123!',
      role: USER_ROLES.TREASURER,
      societyId: societyA._id,
    });
    tokenTreasurerA = generateToken(treasurerA);

    adminA = await User.create({
      name: 'Admin A',
      email: 'admin.a@alpha.com',
      password: 'Password123!',
      role: USER_ROLES.ADMIN,
      societyId: societyA._id,
    });
    tokenAdminA = generateToken(adminA);
  });

  test('RBAC: Resident is blocked from creating funds (Forbidden 403)', async () => {
    const res = await request(app)
      .post('/api/funds')
      .set('Authorization', `Bearer ${tokenResidentA}`)
      .send({
        name: 'Unauthorized Fund',
        code: 'FND-UNAUTH',
        type: 'OPERATIONAL',
        openingBalance: 10000,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/access denied/i);
  });

  test('RBAC: Treasurer is permitted to create funds', async () => {
    const res = await request(app)
      .post('/api/funds')
      .set('Authorization', `Bearer ${tokenTreasurerA}`)
      .send({
        name: 'Operational Maintenance Fund',
        code: 'FND-MAINT',
        type: 'OPERATIONAL',
        openingBalance: 50000,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe('FND-MAINT');
  });

  test('Cross-Society Isolation: Rejects access attempt to another society data', async () => {
    const res = await request(app)
      .get(`/api/dashboard/summary?societyId=${societyB._id}`)
      .set('Authorization', `Bearer ${tokenTreasurerA}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/cross-society/i);
  });
});
