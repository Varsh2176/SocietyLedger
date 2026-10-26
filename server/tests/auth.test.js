const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, disconnectTestDB, clearCollections } = require('./setup');
const { Society, User } = require('../src/models');
const { USER_ROLES } = require('../src/config/constants');

describe('Authentication & Authorization Suite', () => {
  let society;

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
  });

  test('POST /api/auth/register - Successfully registers resident account', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Arun Varma',
        email: 'arun@example.com',
        password: 'Password123!',
        phone: '9845012345',
        apartmentNumber: 'B-302',
        societyCode: 'GWH-BLR-01',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('arun@example.com');
    // Security check: public registration must always create Resident role
    expect(res.body.user.role).toBe(USER_ROLES.RESIDENT);
    // Security check: password hash must never be returned in API response
    expect(res.body.user.password).toBeUndefined();
    // Access token returned in body and HttpOnly cookie
    expect(res.body.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('POST /api/auth/register - Rejects registration with duplicate email', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Arun Varma',
      email: 'arun@example.com',
      password: 'Password123!',
      societyCode: 'GWH-BLR-01',
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Arun Duplicate',
      email: 'arun@example.com',
      password: 'AnotherPassword123!',
      societyCode: 'GWH-BLR-01',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test('POST /api/auth/login - Authenticates valid user credentials', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: 'Password123!',
      societyCode: 'GWH-BLR-01',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'priya@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('priya@example.com');
    expect(res.body.accessToken).toBeDefined();
  });

  test('POST /api/auth/login - Rejects invalid password', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: 'Password123!',
      societyCode: 'GWH-BLR-01',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'priya@example.com',
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  test('GET /api/auth/me - Returns current authenticated user via token', async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Arun Varma',
      email: 'arun@example.com',
      password: 'Password123!',
      societyCode: 'GWH-BLR-01',
    });

    const token = regRes.body.accessToken;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('arun@example.com');
  });

  test('POST /api/auth/logout - Clears session cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
