const mongoose = require('mongoose');
const { APPROVAL_STATUS } = require('../config/constants');
const { rupeesToPaise, paiseToRupees } = require('../utils/money');

const decisionHistorySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: Object.values(APPROVAL_STATUS),
    },
    decidedBy: {
      type: String,
      required: true,
      trim: true,
    },
    decidedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    comments: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const expenseRequestSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Society reference is required'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    requestedAmount: {
      type: Number,
      required: [true, 'Requested amount is required'],
      min: [0, 'Requested amount cannot be negative'],
    },
    requestedAmountInPaise: {
      type: Number,
      required: [true, 'Requested amount in paise is required'],
      min: [0, 'Requested amount in paise cannot be negative'],
    },
    fund: {
      type: String,
      trim: true,
    },
    fundCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    fundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fund',
    },
    relatedEvent: {
      type: String,
      trim: true,
      default: null,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
    vendorName: {
      type: String,
      trim: true,
      default: null,
    },
    quotationRef: {
      type: String,
      trim: true,
      default: null,
    },
    invoiceNumber: {
      type: String,
      trim: true,
      default: null,
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    requesterName: {
      type: String,
      trim: true,
      required: true,
    },
    requesterEmail: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: Object.values(APPROVAL_STATUS),
      default: APPROVAL_STATUS.PENDING,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    decisionHistory: [decisionHistorySchema],
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        if (ret.submissionDate instanceof Date) {
          ret.submissionDate = ret.submissionDate.toISOString().split('T')[0];
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

expenseRequestSchema.pre('validate', function (next) {
  if (this.requestedAmount !== undefined && this.requestedAmountInPaise === undefined) {
    this.requestedAmountInPaise = rupeesToPaise(this.requestedAmount);
  } else if (this.requestedAmountInPaise !== undefined && this.requestedAmount === undefined) {
    this.requestedAmount = paiseToRupees(this.requestedAmountInPaise);
  }
  next();
});

const ExpenseRequest = mongoose.model('ExpenseRequest', expenseRequestSchema);
module.exports = ExpenseRequest;
