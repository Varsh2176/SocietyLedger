const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, disconnectTestDB, clearCollections } = require('./setup');
const { Society, User, ExpenseRequest } = require('../src/models');
const { USER_ROLES, APPROVAL_STATUS } = require('../src/config/constants');
const { generateToken } = require('../src/services/authService');

describe('Expense Requests & Separation of Duties Suite', () => {
  let society;
  let treasurerUser, committeeUser;
  let tokenTreasurer, tokenCommittee;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearCollections();

    society = await Society.create({ name: 'Greenwood Heights RWA', code: 'GWH-BLR-01' });

    treasurerUser = await User.create({
      name: 'Priya Sharma',
      email: 'priya@society.org',
      password: 'Password123!',
      role: USER_ROLES.TREASURER,
      societyId: society._id,
    });
    tokenTreasurer = generateToken(treasurerUser);

    committeeUser = await User.create({
      name: 'Sunil Rao',
      email: 'sunil@society.org',
      password: 'Password123!',
      role: USER_ROLES.COMMITTEE_MEMBER,
      societyId: society._id,
    });
    tokenCommittee = generateToken(committeeUser);
  });

  test('POST /api/approvals - Submits an expense request', async () => {
    const res = await request(app)
      .post('/api/approvals')
      .set('Authorization', `Bearer ${tokenTreasurer}`)
      .send({
        description: 'Common Area LED Floodlights Replacement',
        requestedAmount: 18000,
        fund: 'Monthly Maintenance & Operational Account',
        vendorName: 'Philips Lighting India',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe(APPROVAL_STATUS.PENDING);
    expect(res.body.data.requestedAmount).toBe(18000);
    expect(res.body.data.requesterEmail).toBe('priya@society.org');
  });

  test('POST /api/approvals/:id/decision - Separation of Duties: Prohibits requester from self-approving', async () => {
    // Expense submitted by Priya (Treasurer)
    const expense = await ExpenseRequest.create({
      societyId: society._id,
      description: 'Emergency Water Tankers',
      requestedAmount: 12000,
      requestedAmountInPaise: 1200000,
      requesterId: treasurerUser._id,
      requesterName: treasurerUser.name,
      requesterEmail: treasurerUser.email,
      status: APPROVAL_STATUS.PENDING,
    });

    // Priya tries to self-approve her own request
    const res = await request(app)
      .post(`/api/approvals/${expense._id}/decision`)
      .set('Authorization', `Bearer ${tokenTreasurer}`)
      .send({
        action: APPROVAL_STATUS.APPROVED,
        comments: 'Self approval attempt.',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/separation-of-duties violation/i);
  });

  test('POST /api/approvals/:id/decision - Independent committee member can approve request', async () => {
    // Expense submitted by Priya (Treasurer)
    const expense = await ExpenseRequest.create({
      societyId: society._id,
      description: 'Emergency Water Tankers',
      requestedAmount: 12000,
      requestedAmountInPaise: 1200000,
      requesterId: treasurerUser._id,
      requesterName: treasurerUser.name,
      requesterEmail: treasurerUser.email,
      status: APPROVAL_STATUS.PENDING,
    });

    // Sunil (Independent Committee Member) approves it
    const res = await request(app)
      .post(`/api/approvals/${expense._id}/decision`)
      .set('Authorization', `Bearer ${tokenCommittee}`)
      .send({
        action: APPROVAL_STATUS.APPROVED,
        comments: 'Verified against gate tanker logbook. Sanctioned.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe(APPROVAL_STATUS.APPROVED);
    expect(res.body.data.decisionHistory[0].action).toBe(APPROVAL_STATUS.APPROVED);
    expect(res.body.data.decisionHistory[0].comments).toContain('Verified against gate tanker logbook');
  });
});
