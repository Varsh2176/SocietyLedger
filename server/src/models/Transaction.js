const mongoose = require('mongoose');
const {
  TRANSACTION_STATUS,
  TRANSACTION_TYPES,
  PAYMENT_METHODS,
} = require('../config/constants');
const { rupeesToPaise, paiseToRupees } = require('../utils/money');

const transactionSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Society reference is required'],
      index: true,
    },
    reference: {
      type: String,
      required: [true, 'Transaction voucher reference is required'],
      unique: true,
      trim: true,
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      required: [true, 'Transaction type is required'],
      index: true,
    },
    fundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fund',
      index: true,
    },
    fund: {
      type: String,
      trim: true,
      required: [true, 'Fund name is required'],
    },
    fundCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    toFundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fund',
    },
    toFund: {
      type: String,
      trim: true,
    },
    toFundCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    amountInPaise: {
      type: Number,
      required: [true, 'Amount in paise is required'],
      min: [0, 'Amount in paise cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      default: PAYMENT_METHODS.NEFT_RTGS,
    },
    status: {
      type: String,
      enum: Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.PENDING,
      index: true,
    },
    vendorName: {
      type: String,
      trim: true,
      default: null,
    },
    invoiceNumber: {
      type: String,
      trim: true,
      default: null,
    },
    verifiedBy: {
      type: String,
      trim: true,
      default: null,
    },
    approvedBy: {
      type: String,
      trim: true,
      default: null,
    },
    reconciliationReference: {
      type: String,
      trim: true,
      default: null,
    },
    expenseRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExpenseRequest',
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    reversalReason: {
      type: String,
      trim: true,
    },
    reversedAt: {
      type: Date,
    },
    reversedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        // Format date string to YYYY-MM-DD for consistency with frontend
        if (ret.date instanceof Date) {
          ret.date = ret.date.toISOString().split('T')[0];
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Synchronize amount and amountInPaise
transactionSchema.pre('validate', function (next) {
  if (this.amount !== undefined && this.amountInPaise === undefined) {
    this.amountInPaise = rupeesToPaise(this.amount);
  } else if (this.amountInPaise !== undefined && this.amount === undefined) {
    this.amount = paiseToRupees(this.amountInPaise);
  }
  next();
});

// Indexes for common queries
transactionSchema.index({ societyId: 1, date: -1 });
transactionSchema.index({ societyId: 1, status: 1 });
transactionSchema.index({ societyId: 1, type: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
