const mongoose = require('mongoose');

const reconciliationSchema = new mongoose.Schema(
  {
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: [true, 'Associated society reference is required']
    },
    fund: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fund',
      required: [true, 'Fund reference is required']
    },
    statementPeriod: {
      startDate: {
        type: Date,
        required: [true, 'Statement period start date is required']
      },
      endDate: {
        type: Date,
        required: [true, 'Statement period end date is required']
      },
      label: {
        type: String,
        trim: true
      }
    },
    openingBalance: {
      type: Number,
      required: [true, 'Opening balance is required']
    },
    closingBalance: {
      type: Number,
      required: [true, 'Closing balance is required']
    },
    statementBalance: {
      type: Number,
      required: [true, 'Statement balance from bank is required']
    },
    systemCalculatedBalance: {
      type: Number,
      required: [true, 'System-calculated ledger balance is required']
    },
    differenceAmount: {
      type: Number,
      required: [true, 'Difference amount is required'],
      default: 0
    },
    reconciliationStatus: {
      type: String,
      enum: {
        values: ['Draft', 'In Progress', 'Reconciled', 'Discrepancy Detected', 'Approved'],
        message: '{VALUE} is not a valid reconciliation status'
      },
      default: 'Draft',
      required: [true, 'Reconciliation status is required']
    },
    supportingDocuments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
      }
    ],
    unreconciledItems: [
      {
        transaction: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Transaction'
        },
        description: { type: String, trim: true },
        amount: { type: Number },
        reason: { type: String, trim: true }
      }
    ],
    preparedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Preparer user reference is required']
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
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

reconciliationSchema.index({ society: 1, fund: 1, 'statementPeriod.startDate': -1 });
reconciliationSchema.index({ society: 1, reconciliationStatus: 1 });
reconciliationSchema.index({ preparedBy: 1 });

const Reconciliation = mongoose.model('Reconciliation', reconciliationSchema);

module.exports = Reconciliation;
