const mongoose = require('mongoose');
const { rupeesToPaise, paiseToRupees } = require('../utils/money');

const unmatchedEntrySchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      default: 'UNCLEARED_CHEQUE',
    },
    discrepancyNote: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const reconciliationSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Society reference is required'],
      index: true,
    },
    accountName: {
      type: String,
      required: [true, 'Bank account name is required'],
      trim: true,
    },
    statementPeriod: {
      type: String,
      required: [true, 'Statement period is required'],
      trim: true,
    },
    statementClosingBalance: {
      type: Number,
      required: true,
    },
    statementClosingBalanceInPaise: {
      type: Number,
      required: true,
    },
    bookClosingBalance: {
      type: Number,
      required: true,
    },
    bookClosingBalanceInPaise: {
      type: Number,
      required: true,
    },
    differenceAmount: {
      type: Number,
      default: 0,
    },
    differenceAmountInPaise: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['RECONCILED', 'DISCREPANCY_UNRESOLVED', 'PENDING_REVIEW'],
      default: 'PENDING_REVIEW',
      index: true,
    },
    preparedBy: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: String,
      trim: true,
    },
    reconciledAt: {
      type: Date,
      default: null,
    },
    matchedTransactionsCount: {
      type: Number,
      default: 0,
    },
    unmatchedEntries: [unmatchedEntrySchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

reconciliationSchema.pre('validate', function (next) {
  if (this.statementClosingBalance !== undefined && this.statementClosingBalanceInPaise === undefined) {
    this.statementClosingBalanceInPaise = rupeesToPaise(this.statementClosingBalance);
  }
  if (this.bookClosingBalance !== undefined && this.bookClosingBalanceInPaise === undefined) {
    this.bookClosingBalanceInPaise = rupeesToPaise(this.bookClosingBalance);
  }
  this.differenceAmountInPaise = Math.abs(this.statementClosingBalanceInPaise - this.bookClosingBalanceInPaise);
  this.differenceAmount = paiseToRupees(this.differenceAmountInPaise);
  next();
});

const Reconciliation = mongoose.model('Reconciliation', reconciliationSchema);
module.exports = Reconciliation;
