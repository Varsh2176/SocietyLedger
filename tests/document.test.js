const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { Document } = require('../src/models');

describe('Document Metadata Model Validation (Person 3 Core)', () => {
  it('should fail validation when essential metadata fields are missing', async () => {
    const doc = new Document({});
    await assert.rejects(async () => {
      await doc.validate();
    }, (error) => {
      assert.ok(error.errors['society']);
      assert.ok(error.errors['originalFilename']);
      assert.ok(error.errors['documentCategory']);
      assert.ok(error.errors['mimeType']);
      assert.ok(error.errors['fileSize']);
      assert.ok(error.errors['storageKey']);
      assert.ok(error.errors['uploadedBy']);
      return true;
    });
  });

  it('should reject invalid document category', async () => {
    const doc = new Document({
      society: new mongoose.Types.ObjectId(),
      originalFilename: 'test.pdf',
      documentCategory: 'RandomSelfie',
      mimeType: 'application/pdf',
      fileSize: 1024,
      storageKey: 'uploads/test.pdf',
      uploadedBy: new mongoose.Types.ObjectId()
    });
    await assert.rejects(async () => {
      await doc.validate();
    }, (error) => {
      assert.ok(error.errors['documentCategory']);
      return true;
    });
  });

  it('should reject negative file size', async () => {
    const doc = new Document({
      society: new mongoose.Types.ObjectId(),
      originalFilename: 'test.pdf',
      documentCategory: 'Invoice',
      mimeType: 'application/pdf',
      fileSize: -50,
      storageKey: 'uploads/test.pdf',
      uploadedBy: new mongoose.Types.ObjectId()
    });
    await assert.rejects(async () => {
      await doc.validate();
    }, (error) => {
      assert.ok(error.errors['fileSize']);
      return true;
    });
  });

  it('should validate valid document metadata with checksum and classification', async () => {
    const doc = new Document({
      society: new mongoose.Types.ObjectId(),
      originalFilename: 'Vendor_Apex_Security_Aug2025.pdf',
      documentCategory: 'Invoice',
      mimeType: 'application/pdf',
      fileSize: 245600,
      storageProvider: 'mock_secure_storage',
      storageKey: 'vault/soc-001/invoices/2025/inv_apex_aug.pdf',
      relatedEntityType: 'Expense',
      relatedEntityId: new mongoose.Types.ObjectId(),
      uploadedBy: new mongoose.Types.ObjectId(),
      description: 'August monthly security service bill from Apex',
      accessClassification: 'Committee',
      verificationStatus: 'Verified',
      verifiedBy: new mongoose.Types.ObjectId(),
      verifiedAt: new Date(),
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    });
    await assert.doesNotReject(async () => {
      await doc.validate();
    });
  });
});
