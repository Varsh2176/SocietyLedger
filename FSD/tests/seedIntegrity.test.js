const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { generateSeedDataset } = require('../src/seeds/seedData');
const { checkDatasetIntegrity } = require('../src/utils/integrityChecker');
const { verifyFundBalance } = require('../src/utils/balanceCalculator');

describe('Seed Data Integrity and Target Verification', () => {
  const dataset = generateSeedDataset();

  it('should generate exact target counts across all 12 modules', () => {
    assert.equal(dataset.societies.length, 8, 'Target: 8 societies');
    assert.equal(dataset.users.length, 400, 'Target: 400 users');
    assert.equal(dataset.funds.length, 40, 'Target: 40 funds');
    assert.equal(dataset.transactions.length, 3000, 'Target: 3,000 transactions');
    assert.equal(dataset.compliance.length, 240, 'Target: 240 compliance records');
    assert.equal(dataset.documents.length, 600, 'Target: 600 document metadata records');
    assert.equal(dataset.reconciliations.length, 100, 'Target: 100 reconciliation records');
    assert.equal(dataset.auditLogs.length, 1500, 'Target: 1,500 audit logs');
    assert.equal(dataset.auditObservations.length, 150, 'Target: 150 audit observations');
    assert.equal(dataset.events.length, 120, 'Target: 120 events');
    assert.equal(dataset.expenses.length, 300, 'Target: 300 expense requests');
    assert.equal(dataset.residentQueries.length, 200, 'Target: 200 resident queries');
  });

  it('should pass all referential integrity checks with zero foreign-key errors', () => {
    const result = checkDatasetIntegrity(dataset);
    assert.equal(result.isValid, true);
    assert.deepEqual(result.errors, []);
  });

  it('should maintain mathematical double-entry balance equality for all 40 funds', () => {
    for (const fund of dataset.funds) {
      const check = verifyFundBalance(fund, dataset.transactions);
      assert.equal(
        check.isConsistent,
        true,
        `Fund ${fund.name} (${fund._id}) balance mismatch: recorded ${fund.currentBalance} != calculated ${check.calculatedBalance}`
      );
    }
  });

  it('should have strictly positive amounts on all 3,000 transactions', () => {
    for (const tx of dataset.transactions) {
      assert.ok(tx.amount > 0, `Transaction ${tx.referenceNumber} has non-positive amount: ${tx.amount}`);
    }
  });

  it('should enforce unique emails across all 400 users', () => {
    const emails = new Set();
    for (const u of dataset.users) {
      assert.ok(!emails.has(u.email), `Duplicate user email found: ${u.email}`);
      emails.add(u.email);
    }
    assert.equal(emails.size, 400);
  });

  it('should enforce unique codes across all 8 societies', () => {
    const codes = new Set();
    for (const s of dataset.societies) {
      assert.ok(!codes.has(s.code), `Duplicate society code found: ${s.code}`);
      codes.add(s.code);
    }
    assert.equal(codes.size, 8);
  });
});
