const mongoose = require('mongoose');
const { FUND_TYPES } = require('../config/constants');
const { rupeesToPaise, paiseToRupees } = require('../utils/money');

const fundSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Society reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Fund name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Fund code is required'],
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(FUND_TYPES),
      required: [true, 'Fund type is required'],
    },
    openingBalance: {
      type: Number,
      default: 0,
    },
    openingBalanceInPaise: {
      type: Number,
      default: 0,
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
    currentBalanceInPaise: {
      type: Number,
      default: 0,
    },
    restrictedUse: {
      type: Boolean,
      default: false,
    },
    purpose: {
      type: String,
      trim: true,
    },
    fiscalYear: {
      type: String,
      default: 'FY 2026-27',
      trim: true,
    },
    bankAccount: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'CLOSED'],
      default: 'ACTIVE',
    },
    lastReconciledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        // Ensure decimal and paise are synchronized in JSON serialization
        if (ret.currentBalanceInPaise !== undefined && ret.currentBalance === undefined) {
          ret.currentBalance = paiseToRupees(ret.currentBalanceInPaise);
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Pre-save hook to synchronize rupee and paise fields
fundSchema.pre('save', function (next) {
  if (this.isModified('openingBalance') && !this.isModified('openingBalanceInPaise')) {
    this.openingBalanceInPaise = rupeesToPaise(this.openingBalance);
  } else if (this.isModified('openingBalanceInPaise') && !this.isModified('openingBalance')) {
    this.openingBalance = paiseToRupees(this.openingBalanceInPaise);
  }

  if (this.isModified('currentBalance') && !this.isModified('currentBalanceInPaise')) {
    this.currentBalanceInPaise = rupeesToPaise(this.currentBalance);
  } else if (this.isModified('currentBalanceInPaise') && !this.isModified('currentBalance')) {
    this.currentBalance = paiseToRupees(this.currentBalanceInPaise);
  }
  next();
});

// Compound unique index for code per society
fundSchema.index({ societyId: 1, code: 1 }, { unique: true });

const Fund = mongoose.model('Fund', fundSchema);
module.exports = Fund;
