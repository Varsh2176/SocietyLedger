const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Associated society reference is required']
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    fund: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fund',
      required: [true, 'Related fund reference is required']
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: [150, 'Expense title cannot exceed 150 characters']
    },
    category: {
      type: String,
      enum: {
        values: [
          'Catering & Food',
          'Decoration & Lights',
          'Audio/Visual & Sound',
          'Security & Safety',
          'Sanitation & Cleaning',
          'Repairs & Maintenance',
          'Legal & Professional',
          'Utilities & Diesel',
          'Prizes & Gifts',
          'Printing & Stationery',
          'Miscellaneous'
        ],
        message: '{VALUE} is not a valid expense category'
      },
      required: [true, 'Expense category is required']
    },
    vendor: {
      name: { type: String, required: [true, 'Vendor name is required'], trim: true },
      contactPerson: { type: String, trim: true },
      phone: { type: String, trim: true },
      panGstin: { type: String, trim: true }
    },
    quotations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
      }
    ],
    invoiceNumber: {
      type: String,
      trim: true
    },
    invoiceDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    },
    requestedAmount: {
      type: Number,
      required: [true, 'Requested amount is required'],
      min: [0.01, 'Requested amount must be greater than zero']
    },
    approvedAmount: {
      type: Number,
      min: [0, 'Approved amount cannot be negative'],
      default: 0
    },
    advanceAmount: {
      type: Number,
      min: [0, 'Advance amount cannot be negative'],
      default: 0
    },
    paidAmount: {
      type: Number,
      min: [0, 'Paid amount cannot be negative'],
      default: 0
    },
    refundAmount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative'],
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: {
        values: [
          'Requested',
          'Approved',
          'Rejected',
          'Advance Paid',
          'Fully Paid',
          'Refunded',
          'Settled'
        ],
        message: '{VALUE} is not a valid payment status'
      },
      default: 'Requested',
      required: [true, 'Payment status is required']
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester user reference is required']
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
      }
    ],
    settlementDate: {
      type: Date
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

expenseSchema.index({ society: 1, paymentStatus: 1 });
expenseSchema.index({ society: 1, event: 1 });
expenseSchema.index({ society: 1, invoiceNumber: 1 });
expenseSchema.index({ fund: 1 });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
