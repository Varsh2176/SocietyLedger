const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

const {
  Society,
  User,
  Fund,
  Transaction,
  Event,
  Expense
} = require('../src/models');

describe('Society Model Validation', () => {
  it('should fail validation when required fields are missing', async () => {
    const society = new Society({});
    await assert.rejects(async () => {
      await society.validate();
    }, (error) => {
      assert.ok(error.errors['name']);
      assert.ok(error.errors['code']);
      assert.ok(error.errors['address.street']);
      assert.ok(error.errors['contact.email']);
      return true;
    });
  });

  it('should reject invalid society code format', async () => {
    const society = new Society({
      name: 'Sunrise Enclave',
      code: 'so', // too short
      address: { street: 'Main Rd', city: 'Pune', state: 'MH', postalCode: '411001' },
      contact: { email: 'office@sunrise.in', phone: '9876543210' },
      registration: { registrationNumber: 'REG-123' }
    });
    await assert.rejects(async () => {
      await society.validate();
    }, (error) => {
      assert.ok(error.errors['code']);
      return true;
    });
  });

  it('should validate valid society data', async () => {
    const society = new Society({
      name: 'Sunrise Heights Co-operative Housing Society',
      code: 'SOC-PUN-101',
      address: {
        street: '12 MG Road',
        city: 'Pune',
        state: 'Maharashtra',
        postalCode: '411001',
        country: 'India'
      },
      contact: {
        email: 'info@sunriseheights.org',
        phone: '+91 20 2567 8900'
      },
      registration: {
        registrationNumber: 'PUN/HSG/2020/456',
        taxIdentifier: 'AABCS1234D'
      },
      status: 'Active'
    });
    await assert.doesNotReject(async () => {
      await society.validate();
    });
  });
});

describe('User Model Validation', () => {
  it('should reject invalid role', async () => {
    const user = new User({
      name: 'Kavita Iyer',
      email: 'kavita@example.com',
      password: 'password123',
      society: new mongoose.Types.ObjectId(),
      role: 'SuperPresident' // invalid role
    });
    await assert.rejects(async () => {
      await user.validate();
    }, (error) => {
      assert.ok(error.errors['role']);
      return true;
    });
  });

  it('should validate valid user with supported role', async () => {
    const user = new User({
      name: 'Amitabh Sen',
      email: 'amitabh.treasurer@society.org',
      password: 'SecuredPassword@123',
      phone: '+91 98200 12345',
      society: new mongoose.Types.ObjectId(),
      role: 'Treasurer',
      unitDetails: {
        flatNumber: 'A-402',
        wing: 'Wing A',
        ownershipType: 'Owner'
      },
      accountStatus: 'Active'
    });
    await assert.doesNotReject(async () => {
      await user.validate();
    });
  });
});

describe('Fund Model Validation', () => {
  it('should reject negative opening balance', async () => {
    const fund = new Fund({
      society: new mongoose.Types.ObjectId(),
      name: 'Deficit Fund',
      type: 'Corpus fund',
      openingBalance: -500,
      currentBalance: -500,
      financialYear: '2025-2026'
    });
    await assert.rejects(async () => {
      await fund.validate();
    }, (error) => {
      assert.ok(error.errors['openingBalance']);
      return true;
    });
  });

  it('should reject unsupported fund type', async () => {
    const fund = new Fund({
      society: new mongoose.Types.ObjectId(),
      name: 'Cryptocurrency Fund',
      type: 'Crypto Arbitrage Fund',
      openingBalance: 1000,
      currentBalance: 1000,
      financialYear: '2025-2026'
    });
    await assert.rejects(async () => {
      await fund.validate();
    }, (error) => {
      assert.ok(error.errors['type']);
      return true;
    });
  });

  it('should validate valid fund with masked bank details', async () => {
    const fund = new Fund({
      society: new mongoose.Types.ObjectId(),
      name: 'General Maintenance Fund',
      type: 'Maintenance fund',
      openingBalance: 250000,
      currentBalance: 320000,
      financialYear: '2025-2026',
      status: 'Active',
      bankAccountDetails: {
        bankName: 'HDFC Bank',
        accountNumberMasked: 'XXXXXXXX4589',
        ifsc: 'HDFC0001234'
      }
    });
    await assert.doesNotReject(async () => {
      await fund.validate();
    });
  });
});

describe('Financial Transaction Model Validation', () => {
  it('should reject non-positive transaction amounts', async () => {
    const tx = new Transaction({
      society: new mongoose.Types.ObjectId(),
      fund: new mongoose.Types.ObjectId(),
      transactionType: 'Contribution',
      direction: 'Credit',
      amount: 0,
      description: 'Zero test',
      referenceNumber: 'TXN-001',
      paymentMethod: 'UPI',
      createdBy: new mongoose.Types.ObjectId()
    });
    await assert.rejects(async () => {
      await tx.validate();
    }, (error) => {
      assert.ok(error.errors['amount']);
      return true;
    });
  });

  it('should require destinationFund for Transfer transaction type', async () => {
    const tx = new Transaction({
      society: new mongoose.Types.ObjectId(),
      fund: new mongoose.Types.ObjectId(),
      transactionType: 'Transfer',
      direction: 'Debit',
      amount: 5000,
      description: 'Transfer without destination',
      referenceNumber: 'TXN-TRF-001',
      paymentMethod: 'Internal Transfer',
      createdBy: new mongoose.Types.ObjectId()
    });
    await assert.rejects(async () => {
      await tx.validate();
    }, (error) => {
      assert.ok(error.errors['destinationFund']);
      return true;
    });
  });

  it('should reject Transfer when source and destination funds are identical', async () => {
    const fundId = new mongoose.Types.ObjectId();
    const tx = new Transaction({
      society: new mongoose.Types.ObjectId(),
      fund: fundId,
      destinationFund: fundId,
      transactionType: 'Transfer',
      direction: 'Debit',
      amount: 5000,
      description: 'Self transfer',
      referenceNumber: 'TXN-TRF-002',
      paymentMethod: 'Internal Transfer',
      createdBy: new mongoose.Types.ObjectId()
    });
    await assert.rejects(async () => {
      await tx.validate();
    }, (error) => {
      assert.ok(error.errors['destinationFund']);
      return true;
    });
  });
});

describe('Event & Expense Validation', () => {
  it('should reject event if endDate is earlier than startDate', async () => {
    const event = new Event({
      society: new mongoose.Types.ObjectId(),
      title: 'Holi Festival',
      eventType: 'Cultural Festival',
      startDate: new Date('2025-03-25'),
      endDate: new Date('2025-03-20'),
      approvedBudget: 25000,
      organizedBy: new mongoose.Types.ObjectId(),
      relatedFund: new mongoose.Types.ObjectId()
    });
    await assert.rejects(async () => {
      await event.validate();
    }, (error) => {
      assert.ok(error.errors['endDate']);
      return true;
    });
  });

  it('should reject expense with non-positive requestedAmount', async () => {
    const expense = new Expense({
      society: new mongoose.Types.ObjectId(),
      fund: new mongoose.Types.ObjectId(),
      title: 'Free Food',
      category: 'Catering & Food',
      vendor: { name: 'Foodie Caterers' },
      requestedAmount: -100,
      requestedBy: new mongoose.Types.ObjectId()
    });
    await assert.rejects(async () => {
      await expense.validate();
    }, (error) => {
      assert.ok(error.errors['requestedAmount']);
      return true;
    });
  });
});
