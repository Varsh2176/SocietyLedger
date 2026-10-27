const mongoose = require('mongoose');

const fundSchema = new mongoose.Schema(
  {
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Associated society reference is required']
    },
    name: {
      type: String,
      required: [true, 'Fund name is required'],
      trim: true,
      maxlength: [120, 'Fund name cannot exceed 120 characters']
    },
    type: {
      type: String,
      enum: {
        values: [
          'Corpus fund',
          'Maintenance fund',
          'Emergency fund',
          'Event fund',
          'Reserve fund',
          'Sinking fund',
          'Special Project fund'
        ],
        message: '{VALUE} is not a valid fund type'
      },
      required: [true, 'Fund type is required']
    },
    description: {
      type: String,
      trim: true
    },
    openingBalance: {
      type: Number,
      required: [true, 'Opening balance is required'],
      min: [0, 'Opening balance cannot be negative'],
      default: 0
    },
    currentBalance: {
      type: Number,
      required: [true, 'Current balance is required'],
      default: 0
    },
    isRestricted: {
      type: Boolean,
      default: false
    },
    applicableRestrictions: [
      {
        type: String,
        trim: true
      }
    ],
    financialYear: {
      type: String,
      required: [true, 'Financial year is required'],
      match: [/^[0-9]{4}-[0-9]{4}$/, 'Financial year must match YYYY-YYYY format, e.g. 2025-2026'],
      default: '2025-2026'
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Inactive', 'Closed', 'Frozen'],
        message: '{VALUE} is not a valid fund status'
      },
      default: 'Active'
    },
    bankAccountDetails: {
      bankName: { type: String, trim: true },
      accountNumberMasked: {
        type: String,
        trim: true,
        match: [/^X{4,12}[0-9]{4}$/, 'Bank account number must be securely masked, e.g. XXXXXXXX1234']
      },
      ifsc: {
        type: String,
        trim: true,
        uppercase: true,
        match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC format']
      }
    }
  },
  {
    timestamps: true
  }
);

fundSchema.index({ society: 1, type: 1 });
fundSchema.index({ society: 1, status: 1 });
fundSchema.index({ society: 1, financialYear: 1 });

const Fund = mongoose.model('Fund', fundSchema);

module.exports = Fund;
