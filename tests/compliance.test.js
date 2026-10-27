const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { Compliance } = require('../src/models');

describe('Compliance Model Validation (Person 3 Core)', () => {
  it('should fail validation when essential fields are omitted', async () => {
    const compliance = new Compliance({});
    await assert.rejects(async () => {
      await compliance.validate();
    }, (error) => {
      assert.ok(error.errors['society']);
      assert.ok(error.errors['complianceCategory']);
      assert.ok(error.errors['complianceType']);
      assert.ok(error.errors['financialYear']);
      assert.ok(error.errors['applicablePeriod']);
      assert.ok(error.errors['dueDate']);
      assert.ok(error.errors['responsiblePerson']);
      assert.ok(error.errors['createdBy']);
      return true;
    });
  });

  it('should reject invalid compliance categories', async () => {
    const compliance = new Compliance({
      society: new mongoose.Types.ObjectId(),
      complianceCategory: 'Cryptocurrency Compliance',
      complianceType: 'Tax Audit',
      financialYear: '2025-2026',
      applicablePeriod: 'Q1',
      dueDate: new Date(),
      responsiblePerson: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId()
    });
    await assert.rejects(async () => {
      await compliance.validate();
    }, (error) => {
      assert.ok(error.errors['complianceCategory']);
      return true;
    });
  });

  it('should reject invalid compliance status', async () => {
    const compliance = new Compliance({
      society: new mongoose.Types.ObjectId(),
      complianceCategory: 'Tax',
      complianceType: 'TDS Return',
      financialYear: '2025-2026',
      applicablePeriod: 'Q1',
      dueDate: new Date(),
      responsiblePerson: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId(),
      status: 'Forgotten'
    });
    await assert.rejects(async () => {
      await compliance.validate();
    }, (error) => {
      assert.ok(error.errors['status']);
      return true;
    });
  });

  it('should reject negative taxLiabilityAmount or paidAmount', async () => {
    const compliance = new Compliance({
      society: new mongoose.Types.ObjectId(),
      complianceCategory: 'Tax',
      complianceType: 'TDS Return 26Q',
      financialYear: '2025-2026',
      applicablePeriod: 'Q1',
      dueDate: new Date(),
      responsiblePerson: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId(),
      taxLiabilityAmount: -5000
    });
    await assert.rejects(async () => {
      await compliance.validate();
    }, (error) => {
      assert.ok(error.errors['taxLiabilityAmount']);
      return true;
    });
  });

  it('should validate valid compliance record with supporting documents and revisions', async () => {
    const compliance = new Compliance({
      society: new mongoose.Types.ObjectId(),
      complianceCategory: 'Fire Safety',
      complianceType: 'Annual Fire NOC Renewal Inspection',
      financialYear: '2025-2026',
      applicablePeriod: 'Annual 2025',
      dueDate: new Date('2025-08-31'),
      responsiblePerson: new mongoose.Types.ObjectId(),
      assignedRole: 'Treasurer',
      status: 'Filed',
      submissionDate: new Date('2025-08-25'),
      acknowledgementNumber: 'FIRE-NOC-BLR-2025-889',
      taxLiabilityAmount: 25000,
      paidAmount: 25000,
      supportingDocuments: [new mongoose.Types.ObjectId()],
      notes: 'Fire safety inspection passed with zero non-conformances.',
      createdBy: new mongoose.Types.ObjectId(),
      revisionHistory: [
        {
          revisedAt: new Date('2025-08-20'),
          reason: 'Updated pump pressure testing certificate',
          previousStatus: 'In Progress'
        }
      ]
    });
    await assert.doesNotReject(async () => {
      await compliance.validate();
    });
  });
});
