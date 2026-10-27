const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { Reconciliation } = require('../src/models');

describe('Reconciliation Model Validation (Person 3 Core)', () => {
  it('should fail validation when required reconciliation fields are missing', async () => {
    const rec = new Reconciliation({});
    await assert.rejects(async () => {
      await rec.validate();
    }, (error) => {
      assert.ok(error.errors['society']);
      assert.ok(error.errors['fund']);
      assert.ok(error.errors['statementPeriod.startDate']);
      assert.ok(error.errors['statementPeriod.endDate']);
      assert.ok(error.errors['openingBalance']);
      assert.ok(error.errors['closingBalance']);
      assert.ok(error.errors['statementBalance']);
      assert.ok(error.errors['systemCalculatedBalance']);
      assert.ok(error.errors['preparedBy']);
      return true;
    });
  });

  it('should reject invalid reconciliation status', async () => {
    const rec = new Reconciliation({
      society: new mongoose.Types.ObjectId(),
      fund: new mongoose.Types.ObjectId(),
      statementPeriod: {
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-04-30')
      },
      openingBalance: 100000,
      closingBalance: 150000,
      statementBalance: 150000,
      systemCalculatedBalance: 150000,
      differenceAmount: 0,
      preparedBy: new mongoose.Types.ObjectId(),
      reconciliationStatus: 'AuditedSuccessfully'
    });
    await assert.rejects(async () => {
      await rec.validate();
    }, (error) => {
      assert.ok(error.errors['reconciliationStatus']);
      return true;
    });
  });

  it('should validate valid reconciliation record with discrepancy items', async () => {
    const rec = new Reconciliation({
      society: new mongoose.Types.ObjectId(),
      fund: new mongoose.Types.ObjectId(),
      statementPeriod: {
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-05-31'),
        label: 'May 2025 Bank Reconciliation'
      },
      openingBalance: 800000,
      closingBalance: 865000,
      statementBalance: 877500,
      systemCalculatedBalance: 865000,
      differenceAmount: 12500,
      reconciliationStatus: 'Discrepancy Detected',
      supportingDocuments: [new mongoose.Types.ObjectId()],
      unreconciledItems: [
        {
          description: 'Cheque No. 44521 issued to lift repair vendor uncleared',
          amount: 12500,
          reason: 'Bank clearance lag'
        }
      ],
      preparedBy: new mongoose.Types.ObjectId(),
      reviewedBy: new mongoose.Types.ObjectId(),
      reviewedAt: new Date('2025-06-05'),
      notes: 'Difference of 12,500 INR traced to uncleared cheque.'
    });
    await assert.doesNotReject(async () => {
      await rec.validate();
    });
  });
});
